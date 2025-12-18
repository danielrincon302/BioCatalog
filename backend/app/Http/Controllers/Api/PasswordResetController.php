<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user email
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No user found with this email/username.',
            ], 404);
        }

        // Delete any existing tokens for this user
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        // Generate new token
        $token = Str::random(64);

        // Store token
        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Build reset URL
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $resetUrl = "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);

        // Get user's company/zone info
        $user->load('company', 'role');
        $zoneName = $user->company ? $user->company->name : 'N/A';
        $roleName = $user->role ? $user->role->name : 'N/A';

        // Send email
        try {
            Mail::send('emails.password-reset', [
                'user' => $user,
                'resetUrl' => $resetUrl,
                'zoneName' => $zoneName,
                'roleName' => $roleName,
                'appName' => config('app.name', 'BioCatalog'),
            ], function ($message) use ($user) {
                $message->to($user->email, $user->name)
                    ->subject('Restablecer contraseña - ' . config('app.name', 'BioCatalog'));
            });

            return response()->json([
                'success' => true,
                'message' => 'Password reset link sent to your email.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending email. Please try again later.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Find the reset record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset token.',
            ], 400);
        }

        // Check if token is expired (1 hour)
        $tokenCreatedAt = Carbon::parse($resetRecord->created_at);
        if ($tokenCreatedAt->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Reset token has expired. Please request a new one.',
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully.',
        ]);
    }
}
