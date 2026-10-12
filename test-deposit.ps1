$headers = @{
    Authorization = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInB1YmxpY1V1aWQiOiJiNTcyY2ZlZS1jNDkwLTRjM2MtYjhkMy1kYjI3MmVkNWQ4MzciLCJpYXQiOjE3ODk3MTE1OTgsImV4cCI6MTc4OTcxMjc5OH0.L_lG9cJjT3QB8DL6n_1nIAmDs7UbfB910waqbMNoz7c"
}

$numberOfDeposits = 20
$depositAmount = 10

for ($i = 1; $i -le $numberOfDeposits; $i++) {

    $body = @{
        currencyId = 1
        amount = $depositAmount
    } | ConvertTo-Json

    Write-Host "Deposit $i of $numberOfDeposits..."

    try {

        $response = Invoke-RestMethod `
            -Uri "http://localhost:4000/deposit" `
            -Method POST `
            -Headers $headers `
            -ContentType "application/json" `
            -Body $body

        Write-Host "Deposit completed:"
        Write-Host "Deposit Number: $($response.deposit.depositNumber)"
        Write-Host "Transaction ID: $($response.deposit.transactionId)"
        Write-Host "Amount: $($response.deposit.amount)"
        Write-Host ""

    }
    catch {

        Write-Host "Deposit $i FAILED"
        Write-Host $_.Exception.Message
        Write-Host ""

    }
}

Write-Host "Completed $numberOfDeposits deposit attempts."