<?php
// Dev tool: turns <package>/sections/*.html and <package>/layout.html into the AST the app renders, using the
// SERVER builder (HtmlAstBuilder, branch feat/template-packages-api) so the HTML is checked by the same rules.
// usage: php build-ast.php <lib dir> <package dir>   -> writes <package dir>/ast.json
[$self, $lib, $dir] = $argv;
foreach (glob("$lib/*.php") as $f) { require_once $f; }
use App\Support\TemplatePackage\{HtmlAstBuilder, Report};

$assets = [];
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$dir/assets", FilesystemIterator::SKIP_DOTS));
foreach ($it as $f) { $assets[] = 'assets/' . substr($f->getPathname(), strlen("$dir/assets/")); }

$strings = is_file("$dir/strings.json") ? json_decode(file_get_contents("$dir/strings.json"), true) : [];
$stringKeys = array_keys($strings['es'] ?? []);
$report = new Report; $out = ['templates' => new stdClass, 'layout' => null];
$files = glob("$dir/sections/*.html");
if (is_file("$dir/layout.html")) $files[] = "$dir/layout.html";
foreach ($files as $path) {
    $rel = substr($path, strlen($dir) + 1);
    $kind = $rel === 'layout.html' ? 'layout' : 'section';
    $type = $kind === 'section' ? str_replace('-', '_', basename($rel, '.html')) : null;
    $built = (new HtmlAstBuilder)->withStrings($stringKeys)->build(file_get_contents($path), $rel, $kind, $type, $assets, $report);
    if ($built === null) continue;
    $ast = $built['ast'];
    if ($kind === 'layout') $out['layout'] = $ast; else $out['templates']->{$type} = $ast;
}
$r = $report->toArray();
fwrite(STDERR, json_encode(['errors' => $r['errors'], 'warnings' => $r['warnings']], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n");
file_put_contents("$dir/ast.json", json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
exit($r['errors'] ? 1 : 0);
