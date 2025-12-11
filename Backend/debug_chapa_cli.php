<?php
// Debug script to test Chapa connection directly
include_once 'config/chapa.php';
$chapaConfig = include 'config/chapa.php';

echo "Testing Chapa Connection...\n";
echo "Secret Key Prefix: " . substr($chapaConfig['secret_key'], 0, 10) . "...\n";

$tx_ref = 'TEST-DEBUG-' . time();
$payload = [
    'amount' => '100',
    'currency' => 'ETB',
    'email' => 'aman_guest@gmail.com',
    'first_name' => 'Aman',
    'last_name' => 'User',
    'tx_ref' => $tx_ref,
    'callback_url' => 'https://example.com/callback',
    'return_url' => 'https://example.com/return',
    "customization" => [
        "title" => "Debug Payment",
        "description" => "Testing API"
    ]
];

$chapaUrl = 'https://api.chapa.co/v1/transaction/initialize';
$ch = curl_init($chapaUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $chapaConfig['secret_key'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); // Loosened for XAMPP
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo "CURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response received:\n";
    print_r(json_decode($response, true));
}

curl_close($ch);
