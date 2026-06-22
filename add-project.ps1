# ============================================================
# add-project.ps1
# Yeni proje gorselleri icin otomatik optimize + kontrol
# Her yeni proje eklemeden ONCE calistir
# ============================================================

$repoRoot   = "C:\Users\Ulas Yener\Documents\GitHub\ulasyener-website"
$imagesRoot = "$repoRoot\images\projects"
$maxWidth   = 1200
$quality    = 82
$warnSizeKB = 500   # Bu esigi gecen WebP dosyalari icin uyari verir

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "ImageMagick bulunamadi." -ForegroundColor Red
    Write-Host "https://imagemagick.org/script/download.php#windows adresinden kur."
    exit 1
}

Write-Host ""
Write-Host "=== PROJE GORSEL KONTROL + OPTIMIZE ===" -ForegroundColor Cyan
Write-Host ""

$extensions = @("*.png", "*.jpg", "*.jpeg")
$allFiles   = @()
foreach ($ext in $extensions) {
    $allFiles += Get-ChildItem -Path $imagesRoot -Recurse -Filter $ext
}

$newFiles = $allFiles | Where-Object {
    $webp = [System.IO.Path]::ChangeExtension($_.FullName, ".webp")
    -not (Test-Path $webp)
}

if ($newFiles.Count -eq 0) {
    Write-Host "Yeni PNG/JPG dosyasi bulunamadi. Tum gorseller zaten WebP." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "$($newFiles.Count) yeni gorsel bulundu - optimize ediliyor..." -ForegroundColor Yellow
    Write-Host ""

    $converted = 0
    $errors    = 0
    $totalBefore = 0
    $totalAfter  = 0

    foreach ($file in $newFiles) {
        $outPath = [System.IO.Path]::ChangeExtension($file.FullName, ".webp")
        $relPath = $file.FullName.Replace($repoRoot, "").TrimStart("\")

        Write-Host "  $relPath" -NoNewline

        $imgInfo = & magick identify -format "%wx%h" "$($file.FullName)" 2>$null
        $dims = $imgInfo -split "x"
        $origW = [int]$dims[0]
        $origH = [int]$dims[1]

        if ($origW -gt $maxWidth -or $origH -gt $maxWidth) {
            Write-Host " [BUYUK: ${origW}x${origH}px - kucultulecek]" -NoNewline -ForegroundColor Yellow
        }

        try {
            & magick convert "$($file.FullName)" `
                -resize "${maxWidth}x${maxWidth}>" `
                -quality $quality `
                -strip `
                "$outPath" 2>$null

            if (Test-Path $outPath) {
                $oldKB = [math]::Round($file.Length / 1KB)
                $newKB = [math]::Round((Get-Item $outPath).Length / 1KB)
                $pct   = [math]::Round((1 - $newKB / $oldKB) * 100)
                $totalBefore += $file.Length
                $totalAfter  += (Get-Item $outPath).Length

                if ($newKB -gt $warnSizeKB) {
                    Write-Host ("  UYARI: {0} KB - beklenenden buyuk!" -f $newKB) -ForegroundColor Yellow
                } else {
                    Write-Host ("  OK: {0} KB -> {1} KB (-%{2})" -f $oldKB, $newKB, $pct) -ForegroundColor Green
                }
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
    Write-Host "--- Optimize Sonucu ---" -ForegroundColor Cyan
    Write-Host "Donusturulen : $converted"
    Write-Host "Hata         : $errors"
    if ($converted -gt 0) {
        $savedMB = [math]::Round(($totalBefore - $totalAfter) / 1MB, 1)
        Write-Host ("Kazanilan    : {0} MB" -f $savedMB) -ForegroundColor Green
    }
    Write-Host ""
}

# ─── Mevcut WebP'leri kontrol et ─────────────────────────────────────────
Write-Host "=== MEVCUT WEBP BOYUT KONTROLU ===" -ForegroundColor Cyan
Write-Host ""

$webpFiles = Get-ChildItem -Path $imagesRoot -Recurse -Filter "*.webp"
$bigFiles  = $webpFiles | Where-Object { $_.Length -gt ($warnSizeKB * 1KB) } | Sort-Object Length -Descending

if ($bigFiles.Count -gt 0) {
    Write-Host "UYARI: $($bigFiles.Count) buyuk WebP dosyasi var (>${warnSizeKB} KB):" -ForegroundColor Yellow
    foreach ($f in $bigFiles) {
        $kb      = [math]::Round($f.Length / 1KB)
        $relPath = $f.FullName.Replace($repoRoot, "").TrimStart("\")
        Write-Host ("  {0} KB  ->  {1}" -f $kb, $relPath) -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Bu dosyalari yeniden optimize etmek ister misin? (E/H)" -ForegroundColor Cyan
    $reopt = Read-Host
    if ($reopt -eq "E" -or $reopt -eq "e") {
        foreach ($f in $bigFiles) {
            $tmp = $f.FullName + ".tmp.webp"
            & magick convert "$($f.FullName)" -quality $quality -strip "$tmp" 2>$null
            if (Test-Path $tmp) {
                $oldKB = [math]::Round($f.Length / 1KB)
                $newKB = [math]::Round((Get-Item $tmp).Length / 1KB)
                Move-Item $tmp $f.FullName -Force
                $relPath = $f.FullName.Replace($repoRoot, "").TrimStart("\")
                Write-Host ("  OK: {0} KB -> {1} KB  ({2})" -f $oldKB, $newKB, $relPath) -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "Tum WebP dosyalari boyut limitinin altinda." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== JSON UZANTI KONTROLU ===" -ForegroundColor Cyan
Write-Host ""

$dataRoot  = "$repoRoot\data"
$jsonFiles = Get-ChildItem -Path $dataRoot -Recurse -Filter "*.json" -ErrorAction SilentlyContinue
$oldExtCount = 0

foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($content -match '\.(png|jpg|jpeg)"') {
        $relPath = $f.FullName.Replace($repoRoot, "").TrimStart("\")
        Write-Host "  ESKI UZANTI: $relPath" -ForegroundColor Yellow
        $oldExtCount++
    }
}

if ($oldExtCount -gt 0) {
    Write-Host ""
    Write-Host "Bu JSON dosyalarinda hala .png/.jpg uzantisi var." -ForegroundColor Yellow
    Write-Host "Otomatik duzeltelim mi? (E/H)" -ForegroundColor Cyan
    $fix = Read-Host
    if ($fix -eq "E" -or $fix -eq "e") {
        foreach ($f in $jsonFiles) {
            $content = Get-Content $f.FullName -Raw -Encoding UTF8
            $new = $content -replace '\.png"', '.webp"' -replace '\.jpg"', '.webp"' -replace '\.jpeg"', '.webp"'
            if ($new -ne $content) {
                [System.IO.File]::WriteAllText($f.FullName, $new, [System.Text.Encoding]::UTF8)
                Write-Host "  Guncellendi: $($f.Name)" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "Tum JSON dosyalari WebP uzantisi kullaniyor." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== TAMAMLANDI ===" -ForegroundColor Cyan
Write-Host "Hazirsa: git add . -> git commit -> git push"
Write-Host ""
