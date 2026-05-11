<?php

namespace App\Filament\Pages;

use App\Models\Package;
use App\Models\User;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Livewire\WithFileUploads;

class UserImport extends Page
{
    use WithFileUploads;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-arrow-up-on-square';
    protected static string|\UnitEnum|null $navigationGroup = 'User Management';
    protected static ?int $navigationSort = 4;
    protected string $view = 'filament.pages.user-import';
    protected static ?string $slug = 'user-import';

    public ?string $defaultPackageId = null;
    public array $results = [];
    public $csvFile = null;
    public bool $importing = false;
    public int $importProgress = 0;

    public function importCsv(): void
    {
        $this->validate([
            'csvFile' => 'required|file|mimes:csv,txt|max:10240',
            'defaultPackageId' => 'nullable|exists:packages,id',
        ]);

        $file = $this->csvFile;
        $this->importing = true;
        $this->importProgress = 0;

        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle);
        $headers = array_map('trim', $headers);

        $requiredFields = ['name', 'email'];
        $missing = array_diff($requiredFields, $headers);
        if (!empty($missing)) {
            fclose($handle);
            $this->importing = false;
            Notification::make()->title('CSV missing required columns: ' . implode(', ', $missing))->warning()->send();
            return;
        }

        $rows = [];
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }
        fclose($handle);

        $totalRows = count($rows);
        $imported = 0;
        $skipped = 0;
        $errors = [];
        $rowIndex = 1;

        foreach ($rows as $index => $row) {
            $rowIndex++;
            $data = array_combine($headers, array_map('trim', $row));

            if (empty($data['name']) || empty($data['email'])) {
                $skipped++;
                $this->importProgress = (int)(($index + 1) / $totalRows * 100);
                $this->dispatch('progress-updated', progress: $this->importProgress);
                continue;
            }

            if (User::where('email', $data['email'])->exists()) {
                $skipped++;
                $this->importProgress = (int)(($index + 1) / $totalRows * 100);
                $this->dispatch('progress-updated', progress: $this->importProgress);
                continue;
            }

            try {
                $userData = [
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password'] ?? 'password123'),
                    'phone' => $data['phone'] ?? null,
                    'username' => $data['username'] ?? Str::before($data['email'], '@') . '_' . Str::random(4),
                    'is_active' => filter_var($data['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    'is_verified' => filter_var($data['is_verified'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    'country' => $data['country'] ?? null,
                    'city' => $data['city'] ?? null,
                    'package_id' => $data['package_id'] ?? $this->defaultPackageId,
                ];

                User::create($userData);
                $imported++;
            } catch (\Exception $e) {
                $skipped++;
                $errors[] = "Row {$rowIndex}: {$e->getMessage()}";
            }

            $this->importProgress = (int)(($index + 1) / $totalRows * 100);
            $this->dispatch('progress-updated', progress: $this->importProgress);
        }

        $this->importing = false;
        $this->importProgress = 100;

        $this->results = [
            'imported' => $imported,
            'skipped' => $skipped,
            'errors' => $errors,
        ];

        Notification::make()
            ->title("Imported {$imported} users" . ($skipped > 0 ? ", {$skipped} skipped" : ''))
            ->success()
            ->send();
    }

    public static function getNavigationLabel(): string
    {
        return 'Import Users';
    }

    public function getTitle(): string
    {
        return 'Import Users from CSV';
    }
}
