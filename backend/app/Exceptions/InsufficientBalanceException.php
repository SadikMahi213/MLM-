<?php
namespace App\Exceptions;

use Exception;

class InsufficientBalanceException extends Exception
{
    protected $message = 'Insufficient balance to complete this transaction.';
    protected $code = 422;
}
