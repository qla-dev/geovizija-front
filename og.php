<?php
/**
 * Link previews for crawlers (Facebook, Instagram DMs, WhatsApp, Twitter, Google...).
 * .htaccess sends only crawler requests for /article/{slug} and /category/{slug} here;
 * people get dist/index.html directly. Serves the same app HTML with that page's
 * title, description and image in place of the default <!-- og:start --> block.
 * Keep the defaults in sync with index.html and components/SEO.tsx.
 */

const SITE = 'https://geovizija.com';
const API = SITE.'/endpoints/api';

$type = $_GET['type'] ?? '';
$slug = (string) ($_GET['slug'] ?? '');
$html = @file_get_contents(__DIR__.'/dist/index.html');

if ($html === false) {
    http_response_code(503);
    exit;
}

header('Content-Type: text/html; charset=UTF-8');
// Not for shared caches: the same URL serves different HTML to people (see .htaccess).
header('Cache-Control: private, no-cache');
header('Vary: User-Agent');

$fetch = function (string $path): ?array {
    $context = stream_context_create(['http' => ['timeout' => 4, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"]]);
    $body = @file_get_contents(API.$path, false, $context);
    $status = isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m) ? (int) $m[1] : 0;
    $json = $body !== false && $status === 200 ? json_decode($body, true) : null;

    return is_array($json['data'] ?? null) ? $json['data'] : null;
};

$meta = null;
if (preg_match('/^[a-z0-9-]{1,191}$/', $slug)) {
    // /preview also answers for scheduled articles: Facebook reads a scheduled Page post's preview when it is created.
    if ($type === 'article' && ($post = $fetch('/posts/'.$slug.'/preview'))) {
        $meta = [
            'type' => 'article',
            'url' => SITE.'/article/'.$post['slug'],
            'title' => $post['title'].' | Geovizija',
            'description' => $post['excerpt'],
            // The 1200x630 link image with the title on it (backend InstagramStory::facebook), else the cover.
            'image' => ($post['shareImageUrl'] ?? null) ?: ($post['imageUrl'] ?: null),
            'extra' => array_filter([
                // Known size lets Facebook show the large preview on the first share.
                'og:image:width' => $post['imageWidth'] ?? null,
                'og:image:height' => $post['imageHeight'] ?? null,
                'article:published_time' => $post['publishedAt'] ?? null,
                'article:section' => $post['category']['name'] ?? null,
                'article:author' => $post['author'] ?? null,
            ]),
        ];
    } elseif ($type === 'category' && ($category = $fetch('/categories/'.$slug))) {
        $meta = [
            'type' => 'website',
            'url' => SITE.'/category/'.$category['id'],
            'title' => $category['name'].' | Geovizija',
            'description' => 'Najnovije vijesti, analize i reportaže iz svijeta '.mb_strtolower($category['name']).'.',
            'image' => $category['imageUrl'] ?: null,
            'extra' => [],
        ];
    }
}

// Unknown or unpublished: the static defaults stay.
if ($meta === null) {
    echo $html;
    exit;
}

$e = fn ($value) => htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$image = $meta['image'] ?? SITE.'/og-default.jpg';

$tags = [
    '<meta name="description" content="'.$e($meta['description']).'" />',
    '<link rel="canonical" href="'.$e($meta['url']).'" />',
    '<meta property="og:type" content="'.$e($meta['type']).'" />',
    '<meta property="og:site_name" content="Geovizija" />',
    '<meta property="og:locale" content="bs_BA" />',
    '<meta property="og:url" content="'.$e($meta['url']).'" />',
    '<meta property="og:title" content="'.$e($meta['title']).'" />',
    '<meta property="og:description" content="'.$e($meta['description']).'" />',
    '<meta property="og:image" content="'.$e($image).'" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    '<meta name="twitter:title" content="'.$e($meta['title']).'" />',
    '<meta name="twitter:description" content="'.$e($meta['description']).'" />',
    '<meta name="twitter:image" content="'.$e($image).'" />',
];
foreach ($meta['extra'] as $property => $value) {
    $tags[] = '<meta property="'.$e($property).'" content="'.$e($value).'" />';
}

$html = preg_replace('#<!-- og:start.*?<!-- og:end -->#s', implode("\n    ", $tags), $html, 1);
$html = preg_replace('#<title>.*?</title>#s', '<title>'.$e($meta['title']).'</title>', $html, 1);

echo $html;
