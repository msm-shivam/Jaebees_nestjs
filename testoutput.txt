# Sport E-Commerce API Test Script
# Tests all 10 layers of the application

$BASE = "http://localhost:3000/api/v1"
$adminToken = $null
$customerToken = $null
$customerId = $null
$brandId = $null
$categoryId = $null
$subCategoryId = $null
$collectionId = $null
$attributeId = $null
$attributeValueId = $null
$tagId = $null
$productId = $null
$imageId = $null
$variantId = $null
$inventoryId = $null
$cartItemId = $null
$orderId = $null
$paymentId = $null
$paymentMethodId = $null
$couponId = $null
$promotionId = $null
$addressId = $null
$warehouseId = $null
$shipmentId = $null
$reviewId = $null

function Headers($token) {
    return @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $token" }
}

function Test-Response($response, $expectedStatus, $testName) {
    $status = $response.statusCode
    if ($status -eq $expectedStatus) {
        Write-Host "  ✅ $testName (Status: $status)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $testName (Expected: $expectedStatus, Got: $status)" -ForegroundColor Red
        try { Write-Host "     Response: $($response | ConvertTo-Json -Depth 5 -Compress)" } catch {}
    }
}

function Post($url, $body, $token=$null) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        return Invoke-RestMethod -Uri $url -Method Post -Headers $h -Body $body -ContentType "application/json"
    } catch {
        return $_.Exception.Response
    }
}

function Get($url, $token=$null) {
    $h = @{}
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        return Invoke-RestMethod -Uri $url -Method Get -Headers $h
    } catch {
        return $_.Exception.Response
    }
}

function Patch($url, $body, $token=$null) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        return Invoke-RestMethod -Uri $url -Method Patch -Headers $h -Body $body
    } catch {
        return $_.Exception.Response
    }
}

function Delete($url, $token=$null) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        return Invoke-RestMethod -Uri $url -Method Delete -Headers $h
    } catch {
        return $_.Exception.Response
    }
}

function Put($url, $body, $token=$null) {
    $h = @{ "Content-Type" = "application/json" }
    if ($token) { $h["Authorization"] = "Bearer $token" }
    try {
        return Invoke-RestMethod -Uri $url -Method Put -Headers $h -Body $body
    } catch {
        return $_.Exception.Response
    }
}

# =============================================================
# LAYER 1: AUTHENTICATION, USERS, ADMIN, RBAC
# =============================================================
Write-Host "`n============================================" -ForegroundColor Yellow
Write-Host "  LAYER 1: AUTH, USERS, ADMIN, RBAC" -ForegroundColor Yellow
Write-Host "============================================`n