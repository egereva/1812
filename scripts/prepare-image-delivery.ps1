$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskPublic = Join-Path $taskRoot 'public'
$taskOutput = Join-Path $taskPublic 'images/delivery'
New-Item -ItemType Directory -Path $taskOutput -Force | Out-Null
$taskCatalog = [ordered]@{}
$taskEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -EQ 'image/jpeg'
$taskHeroNames = @('borodino-hess-1843', 'fili-council-kivshenko-1882', 'retreat-moscow-suchodolski-1853')
$taskComparisons = Get-Content (Join-Path $taskRoot 'content/ru/places.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$taskWideSources = @($taskComparisons | ForEach-Object { $_.beforeAfter | ForEach-Object { $_.before.src; $_.after.src } })
$taskFiles = Get-ChildItem (Join-Path $taskPublic 'images') -File -Recurse | Where-Object { $_.DirectoryName -ne $taskOutput }
foreach ($taskFile in $taskFiles) {
    $taskSrc = '/' + $taskFile.FullName.Substring($taskPublic.Length + 1).Replace('\', '/')
    $taskHash = (Get-FileHash -LiteralPath $taskFile.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    $taskVariants = @()
    if ($taskFile.Extension -eq '.svg') {
        [xml]$taskSvg = Get-Content -LiteralPath $taskFile.FullName -Raw
        $taskWidth = [double]::Parse($taskSvg.svg.width, [System.Globalization.CultureInfo]::InvariantCulture)
        $taskHeight = [double]::Parse($taskSvg.svg.height, [System.Globalization.CultureInfo]::InvariantCulture)
    } else {
        $taskImage = [System.Drawing.Image]::FromFile($taskFile.FullName, $true)
        try {
            $taskOrientation = if ($taskImage.PropertyIdList -contains 274) { [BitConverter]::ToUInt16($taskImage.GetPropertyItem(274).Value, 0) } else { 1 }
            $taskRotation = switch ($taskOrientation) {
                2 { 'RotateNoneFlipX' }; 3 { 'Rotate180FlipNone' }; 4 { 'Rotate180FlipX' }
                5 { 'Rotate90FlipX' }; 6 { 'Rotate90FlipNone' }; 7 { 'Rotate270FlipX' }; 8 { 'Rotate270FlipNone' }
                default { 'RotateNoneFlipNone' }
            }
            $taskImage.RotateFlip([System.Drawing.RotateFlipType]::$taskRotation)
            $taskWidth = $taskImage.Width
            $taskHeight = $taskImage.Height
            if ($taskFile.Length -ge 300000 -and $taskWidth -gt 640) {
                $taskWidths = @(640, 1280)
                if ($taskHeroNames -contains $taskFile.BaseName -or $taskWideSources -contains $taskSrc) { $taskWidths += 1920 }
                foreach ($taskTargetWidth in ($taskWidths | ForEach-Object { [Math]::Min($_, $taskWidth) } | Select-Object -Unique)) {
                    $taskTargetHeight = [int][Math]::Round($taskHeight * $taskTargetWidth / $taskWidth)
                    $taskBitmap = New-Object System.Drawing.Bitmap($taskTargetWidth, $taskTargetHeight)
                    $taskGraphics = [System.Drawing.Graphics]::FromImage($taskBitmap)
                    $taskParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
                    try {
                        $taskGraphics.Clear([System.Drawing.Color]::White)
                        $taskGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                        $taskGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                        $taskGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                        $taskGraphics.DrawImage($taskImage, 0, 0, $taskTargetWidth, $taskTargetHeight)
                        $taskParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
                        $taskStream = New-Object System.IO.MemoryStream
                        try {
                            $taskBitmap.Save($taskStream, $taskEncoder, $taskParameters)
                            # Only publish derivatives with a material byte saving.
                            if ($taskStream.Length -lt $taskFile.Length * 0.8) {
                                $taskName = $taskFile.Directory.Name + '-' + $taskFile.BaseName + '-' + $taskTargetWidth + '.jpg'
                                [System.IO.File]::WriteAllBytes((Join-Path $taskOutput $taskName), $taskStream.ToArray())
                                $taskVariants += [ordered]@{ src = '/images/delivery/' + $taskName; width = $taskTargetWidth; height = $taskTargetHeight; bytes = $taskStream.Length }
                            }
                        } finally { $taskStream.Dispose() }
                    } finally { $taskParameters.Dispose(); $taskGraphics.Dispose(); $taskBitmap.Dispose() }
                }
            }
        } finally { $taskImage.Dispose() }
    }
    if ((Get-FileHash -LiteralPath $taskFile.FullName -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskHash) { throw 'An original changed during processing' }
    $taskCatalog[$taskSrc] = [ordered]@{ width = $taskWidth; height = $taskHeight; bytes = $taskFile.Length; sha256 = $taskHash; variants = @($taskVariants) }
}
$taskJson = $taskCatalog | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText((Join-Path $taskRoot 'app/data/imageDelivery.json'), $taskJson + "`n", (New-Object System.Text.UTF8Encoding($false)))
Write-Output ('Verified {0} originals; generated {1} derivatives' -f $taskCatalog.Count, @($taskCatalog.Values | ForEach-Object { $_.variants }).Count)
