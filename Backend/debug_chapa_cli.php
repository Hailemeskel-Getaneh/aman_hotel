<?php
// Debug script to test Chapa connection directly
include_once 'config/chapa.php';
$chapaConfig = include 'config/chapa.php';

echo "Testing Chapa Connection...\n";
echo "Secret Key Prefix: " . substr($chapaConfig['secret_key'], 0, 10) . "...\n";


$tx_ref_to_verify = 'TX-2-1765527529'; // From logs
$chapaUrl = 'https://api.chapa.co/v1/transaction/verify/' . $tx_ref_to_verify;

echo "Verifying TX: $tx_ref_to_verify\n";

$ch = curl_init($chapaUrl);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $chapaConfig['secret_key'],
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0); 
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);

$response = curl_exec($ch);


if (curl_errno($ch)) {
    echo "CURL Error: " . curl_error($ch) . "\n";
} else {
    echo "Response received:\n";
    print_r(json_decode($response, true));
}

curl_close($ch);
