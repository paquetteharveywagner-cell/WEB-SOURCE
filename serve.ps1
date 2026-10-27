$ports = @(3000, 8080, 5000)
$listener = New-Object System.Net.HttpListener
$boundPorts = @()

foreach ($p in $ports) {
    try {
        $prefix = "http://localhost:$p/"
        $listener.Prefixes.Add($prefix)
        $boundPorts += $p
    } catch {
        Write-Warning "Could not bind to port $p"
    }
}

try {
    $listener.Start()
    foreach ($p in $boundPorts) {
        Write-Host "PITBULL MEDIA Local Server active at: http://localhost:$p/"
    }
} catch {
    Write-Host "Error starting multi-port listener: $_"
    # Fallback to port 3000
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:3000/")
        $listener.Start()
        Write-Host "PITBULL MEDIA Local Server active at: http://localhost:3000/"
    } catch {
        Write-Host "Fatal: could not start listener on port 3000: $_"
        exit 1
    }
}

$baseDir = "c:\Users\Dell\Downloads\WEBSITE CREATION FOLDER"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".htm"  = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".ttf"  = "font/ttf"
}

Write-Host "Server listening for requests..."

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
        if ($urlPath -eq "/" -or [string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "/index.html"
        }

        $relPath = $urlPath.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
        $localPath = Join-Path $baseDir $relPath

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [IO.Path]::GetExtension($localPath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.StatusCode = 200
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

            $bytes = [IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $bytes.Length

            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $errBytes.Length
            if ($request.HttpMethod -ne "HEAD") {
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
        }
        $response.Close()
    } catch {
        # Log and continue serving - never let a single request crash the server loop!
        Write-Host "Request notice: $_"
        try {
            if ($null -ne $context -and $null -ne $context.Response) {
                $context.Response.Abort()
            }
        } catch {}
    }
}
