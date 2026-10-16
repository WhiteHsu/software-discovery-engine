param([Parameter(Mandatory=$true)][string]$ZipPath)
$ErrorActionPreference = 'Stop'
$resolved = (Resolve-Path -LiteralPath $ZipPath).Path
$expected = '53600506b399bb5ffe1e4c8dec794fd378212f14aaf38ccef9b6f89314d11631'
$digest = (Get-FileHash -LiteralPath $resolved -Algorithm SHA256).Hash.ToLowerInvariant()
if ($digest -ne $expected) { throw 'Artifact digest mismatch; no inspection or execution performed.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [IO.Compression.ZipFile]::OpenRead($resolved)
try {
    $prefix = 'LanguageTool-6.6/'
    $versionEntry = $archive.GetEntry($prefix + 'META-INF/maven/org.languagetool/language-en/pom.properties')
    $styleEntry = $archive.GetEntry($prefix + 'org/languagetool/rules/en/style.xml')
    if (!$versionEntry -or !$styleEntry) { throw 'Required artifact entries missing.' }
    $reader = [IO.StreamReader]::new($versionEntry.Open())
    try { $version = $reader.ReadToEnd() } finally { $reader.Dispose() }
    if ($version -notmatch '(?m)^version=6\.6\s*$') { throw 'English module version mismatch.' }
    $reader = [IO.StreamReader]::new($styleEntry.Open())
    try { $style = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $groups = @([regex]::Matches($style, '<rulegroup\b[^>]*\bid="[^"]*PASSIVE[^"]*"[^>]*>') | ForEach-Object {
        $tag = $_.Value
        [ordered]@{
            id = [regex]::Match($tag, '\bid="([^"]+)"').Groups[1].Value
            explicitDefault = if ($tag -match '\bdefault="([^"]+)"') { $Matches[1] } else { 'not-specified-on-group' }
            tags = [regex]::Match($tag, '\btags="([^"]+)"').Groups[1].Value
        }
    })
    if (@($groups | Where-Object { $_.id -eq 'PASSIVE_VOICE' -and $_.explicitDefault -eq 'off' }).Count -ne 1) { throw 'Expected passive rule metadata missing.' }
    [ordered]@{
        version = 1
        artifact = 'LanguageTool-6.6.zip'
        bytes = (Get-Item -LiteralPath $resolved).Length
        sha256 = $digest
        englishModuleVersion = '6.6'
        rulesEntry = $styleEntry.FullName
        passiveRuleGroups = $groups
        method = 'Read-only ZIP metadata/text inspection; no extraction, Java execution or server startup.'
        privacyQualified = $false
    } | ConvertTo-Json -Depth 5
} finally { $archive.Dispose() }
