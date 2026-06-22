$repoRoot   = "C:\Users\Ulas Yener\Documents\GitHub\ulasyener-website"
$imagesRoot = "$repoRoot\images\projects"
$maxWidth   = 1200
$quality    = 82

$useMagick = $false
$useCwebp  = $false

if (Get-Command magick -ErrorAction SilentlyContinue) {
    $useMagick = $true
    Write-Host "ImageMagick bulundu" -ForegroundColor Green
} elseif (Get-Command cwebp -ErrorAction SilentlyContinue) {
    $useCwebp = $true
    Write-Host "cwebp bulundu" -ForegroundColor Green
} else {
    Write-Host "ImageMagick veya cwebp bulunamadi." -ForegroundColor Red
    Write-Host "ImageMagick indir: https://imagemagick.org/script/download.php#windows" -ForegroundColor Yellow
    Write-Host "Kurduktan sonra PowerShell'i kapat, tekrar ac ve scripti calistir."
    exit 1
}

$extensions = @("*.png", "*.jpg", "*.jpeg")
$files = @()
foreach ($ext in $extensions) {
    $files += Get-ChildItem -Path $imagesRoot -Recurse -Filter $ext
}

Write-Host ""
Write-Host "Bulunan dosya: $($files.Count) adet"
Write-Host ""

if ($files.Count -eq 0) {
    Write-Host "Hic dosya bulunamadi. Yol dogru mu?" -ForegroundColor Yellow
    exit 0
}

$totalBefore = ($files | Measure-Object -Property Length -Sum).Sum
Write-Host ("Toplam boyut oncesi: {0:N1} MB" -f ($totalBefore / 1MB))
Write-Host ""

$converted  = 0
$skipped    = 0
$errors     = 0
$totalAfter = 0

foreach ($file in $files) {
    $outPath = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")

    if (Test-Path $outPath) {
        Write-Host "ATLANDI: $($file.Name)" -ForegroundColor DarkGray
        $skipped++
        continue
    }

    Write-Host "Donusturuluyor: $($file.Name)" -NoNewline

    try {
        if ($useMagick) {
            & magick convert "$($file.FullName)" -resize "${maxWidth}x${maxWidth}>" -quality $quality -strip "$outPath" 2>$null
        } else {
            & cwebp -q $quality "$($file.FullName)" -o "$outPath" 2>$null
        }

        if (Test-Path $outPath) {
            $newSize = (Get-Item $outPath).Length
            $oldSize = $file.Length
            $saving  = [math]::Round((1 - $newSize / $oldSize) * 100)
            $totalAfter += $newSize
            Write-Host ("  OK  {0} KB -> {1} KB  (-%{2})" -f [math]::Round($oldSize/1KB), [math]::Round($newSize/1KB), $saving) -ForegroundColor Green
            $converted++
        } else {
            Write-Host "  HATA: cikti olusturulamadi" -ForegroundColor Red
            $errors++
        }
    } catch {
        Write-Host "  HATA: $_" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "--- SONUC ---"
Write-Host "Donusturulen : $converted"
Write-Host "Atlanan      : $skipped"
Write-Host "Hata         : $errors"

if ($converted -gt 0) {
    $savedMB = ($totalBefore - $totalAfter) / 1MB
    $savedPct = [math]::Round((1 - $totalAfter / $totalBefore) * 100)
    Write-Host ("Onceki boyut : {0:N1} MB" -f ($totalBefore / 1MB)) -ForegroundColor Yellow
    Write-Host ("Sonraki boyut: {0:N1} MB" -f ($totalAfter  / 1MB)) -ForegroundColor Green
    Write-Host ("Kazanilan    : {0:N1} MB  (-%{1})" -f $savedMB, $savedPct) -ForegroundColor Green
}

Write-Host ""
Write-Host "Simdi update-json-extensions.ps1 scriptini calistir." -ForegroundColor Cyan
