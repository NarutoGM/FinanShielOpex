import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, dni, email, password } = await request.json();

    // Validaciones básicas
    if (!firstName || !lastName || !dni || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar DNI (8 dígitos)
    if (!/^\d{8}$/.test(dni)) {
      return NextResponse.json(
        { error: "El DNI debe tener exactamente 8 dígitos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de correo electrónico inválido" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rowCount && emailCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 409 }
      );
    }

    // Verificar si el DNI ya existe
    const dniCheck = await pool.query("SELECT id FROM users WHERE dni = $1", [
      dni,
    ]);
    if (dniCheck.rowCount && dniCheck.rowCount > 0) {
      return NextResponse.json(
        { error: "El DNI ya está registrado" },
        { status: 409 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, dni, email, password, role, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, first_name, last_name, dni, email, role`,
      [firstName, lastName, dni, email, hashedPassword, "user"]
    );

    const newUser = result.rows[0];

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: {
          id: newUser.id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          dni: newUser.dni,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    );
  }
}
