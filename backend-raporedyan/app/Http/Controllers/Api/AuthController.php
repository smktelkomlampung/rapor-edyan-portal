<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Validasi input
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('username', 'password');

        // Cek kredensial
        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // Buat token (menggunakan Sanctum)
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil!',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ]
            ], 200);
        }

        // Jika gagal
        return response()->json([
            'success' => false,
            'message' => 'Username atau password salah.'
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout berhasil']);
    }
}
