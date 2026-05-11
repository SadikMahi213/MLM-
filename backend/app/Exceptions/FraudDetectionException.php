<?php
namespace App\Exceptions;
use Exception;
class FraudDetectionException extends Exception
{
    protected $message = 'Transaction flagged by fraud detection.';
    protected $code = 403;
}
