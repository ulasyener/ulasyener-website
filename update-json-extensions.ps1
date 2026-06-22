# ============================================================
# update-json-extensions.ps1
# JSON dosyalarındaki .png ve .jpg referanslarını .webp yapar
# convert-to-webp.ps1'den SONRA çalıştır
# ============================================================

$repoRoot = "C:\Users\Ulas Yener\Documents\GitHub\ulasyener-website"
$dataRoot = "$repoRoot\data"   # JSON'ların olduğu klasör (gerekirse değiştir)

# JSON dosyalarını bul (data/ + root)
$jsonFiles = @()
$jsonFiles += Get-ChildItem -Path $dataRoot  -Recurse -Filter "*.json" -ErrorAction SilentlyContinue
$jsonFiles += Get-ChildItem -Path $repoRoot  -Filter  "*.json" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "── JSON Güncelleme ────────────────────────────────" -ForegroundColor Cyan
Write-Host "$($jsonFiles.Count) adet JSON dosyası bulundu"
Write-Host ""

$updated = 0
foreach ($f in $jsonFiles) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    $new = $content -replace '\.png"', '.webp"' `
                    -replace "\.png'", ".webp'" `
                    -replace '\.jpg"', '.webp"' `
                    -replace "\.jpg'", ".webp'" `
                    -replace '\.jpeg"', '.webp"' `
                    -replace "\.jpeg'", ".webp'"

    if ($new -ne $content) {
        Set-Content -Path $f.FullName -Value $new -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Güncellendi: $($f.Name)" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "  –  Değişiklik yok: $($f.Name)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "── Sonuç ──────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "Güncellenen JSON: $updated dosya"
Write-Host ""
Write-Host "Sonraki adım: git add . + git commit + git push" -ForegroundColor Cyan
