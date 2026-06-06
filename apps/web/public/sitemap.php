<?php
/**
 * Dynamic XML sitemap served at /sitemap.xml (via .htaccess rewrite).
 * Auto-includes published blog posts from blog.json, so it stays current
 * whenever posts are added/edited in the admin dashboard.
 */
header('Content-Type: application/xml; charset=utf-8');

$host = $_SERVER['HTTP_HOST'] ?? 'www.imigratesolution.com';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'https';
$base = $scheme . '://' . $host;
$today = date('Y-m-d');

// Static pages: [path, changefreq, priority]
$pages = [
    ['/', 'weekly', '1.0'],
    ['/australia-migration', 'weekly', '0.9'],
    ['/canada-immigration', 'weekly', '0.9'],
    ['/c11-entrepreneur-work-permit', 'weekly', '0.8'],
    ['/assessment', 'monthly', '0.8'],
    ['/faq', 'monthly', '0.7'],
    ['/blog', 'weekly', '0.7'],
    ['/services', 'monthly', '0.7'],
    ['/success-stories', 'monthly', '0.6'],
    ['/about', 'monthly', '0.6'],
    ['/contact', 'yearly', '0.6'],
    ['/book-appointment', 'yearly', '0.6'],
];

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$url = function ($loc, $lastmod, $freq, $prio) {
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($loc, ENT_XML1) . "</loc>\n";
    if ($lastmod) echo "    <lastmod>" . $lastmod . "</lastmod>\n";
    echo "    <changefreq>" . $freq . "</changefreq>\n";
    echo "    <priority>" . $prio . "</priority>\n";
    echo "  </url>\n";
};

foreach ($pages as $p) {
    $url($base . $p[0], $today, $p[1], $p[2]);
}

// Blog posts from blog.json (skip drafts and future-dated posts)
$blogPath = __DIR__ . '/blog.json';
if (is_file($blogPath)) {
    $data = json_decode((string) file_get_contents($blogPath), true);
    if (is_array($data) && !empty($data['posts'])) {
        foreach ($data['posts'] as $post) {
            if (!empty($post['draft'])) continue;
            $date = $post['publishedDate'] ?? '';
            if ($date && $date > $today) continue; // scheduled
            if (empty($post['slug'])) continue;
            $url($base . '/blog/' . $post['slug'], $date ?: $today, 'monthly', '0.6');
        }
    }
}

echo '</urlset>';
