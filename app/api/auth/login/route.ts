import { NextResponse } from 'next/server';
import pool from "@/lib/db"; // Tu conexión existente
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // 1. Recibir datos del Frontend
    const { user: email, password } = await request.json(); // Renombro 'user' a 'email' para claridad

    if (!email || !password) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // 2. Buscar usuario en PostgreSQL
    // OJO: Asegúrate de que la columna se llame 'email' en tu tabla
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const usuarioDb = result.rows[0];

    // 3. Verificar Contraseña (La magia de Bcrypt)
    // Compara "123456" (password) con "$2b$10$..." (usuarioDb.password)
    const passwordCorrecta = await bcrypt.compare(password, usuarioDb.password);

    if (!passwordCorrecta) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 4. Crear el Token JWT (Tu firma digital)
    // Esto crea un string largo que contiene el ID del usuario
    const token = jwt.sign(
      { 
        id: usuarioDb.id, 
        email: usuarioDb.email,
        role: usuarioDb.role // Opcional, si tienes roles
      },
      process.env.JWT_SECRET || 'secreto_temporal', // ¡Pon esto en tu .env!
      { expiresIn: '8h' }
    );

    // 5. Responder al Frontend
    // Devolvemos el token para que el frontend lo guarde
    return NextResponse.json({
      message: 'Login exitoso',
      token: token, 
      user: {
        id: usuarioDb.id,
        name: usuarioDb.name,
        email: usuarioDb.email
      }
    });

  } catch (error) {
    console.error('Error en Login:', error);
    return NextResponse.json({ error: 'Error en el servidor' }, { status: 500 });
  }
}