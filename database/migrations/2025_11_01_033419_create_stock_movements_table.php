<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_batch_id')->nullable()->constrained('medicine_batches')->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjust']); // in=receive, out=issue (FEFO), adjust=manual correction
            $table->integer('quantity'); // always positive integer
            $table->string('ref')->nullable(); // invoice/no. dokumen
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
