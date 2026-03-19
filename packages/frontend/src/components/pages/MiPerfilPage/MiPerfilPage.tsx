import { useEffect, useState } from "react";
import { MainLayout } from "../../templates/MainLayout";
import { Student } from "../../../entities/student"


export function MiPerfilPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");

  const token = localStorage.getItem("academic_token") || "";

  useEffect(() => {
    loadStudent();
  }, []);

  async function loadStudent() {
    // Obtener userId desde localStorage
    const academicUser = localStorage.getItem("academic_user");
    const userId = academicUser ? JSON.parse(academicUser).id : null;

    if (!userId) {
      console.error("No se encontró userId en localStorage");
      return;
    }

    try {
      // Obtener todos los estudiantes
      const respo = await fetch("http://localhost:3000/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const students: Student[] = await respo.json();

      // Buscar el estudiante con userId
      const myStudent = students.find((s) => s.userId === userId);
      if (!myStudent) {
        console.error("No se encontró un estudiante con este userId");
        return;
      }

      // Obtener datos completos del estudiante
      const response = await fetch(
        `http://localhost:3000/students/${myStudent.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data: Student = await response.json();

      setStudent(data);
      setBirthDate(data.birthDate.split("T")[0]); // YYYY-MM-DD
      setEmail(data.email || "");
    } catch (error) {
      console.error("Error cargando estudiante:", error);
    }
  }

  // Formatear la fecha antes de enviarla al backend
  function formatBirthDateForBackend(dateString: string) {
    return `${dateString}T00:00:00`;
  }

  async function handleSave() {
    if (!student) return;

    try {
      // PATCH birthDate
      await fetch(`http://localhost:3000/students/${student.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          birthDate: formatBirthDateForBackend(birthDate),
        }),
      });

      // PATCH email
      await fetch(`http://localhost:3000/users/${student.userId}/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      alert("Datos actualizados correctamente");
      loadStudent(); // recargar para reflejar cambios
    } catch (error) {
      console.error("Error guardando datos:", error);
    }
  }

  if (!student) {
    return <MainLayout>Cargando...</MainLayout>;
  }

  return (
    <MainLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <h2 className="text-2xl font-bold">Mi Perfil</h2>

        <div className="mt-4 space-y-2">
          <p>
            <b>Nombre:</b> {student.firstName} {student.lastName}
          </p>
          <p>
            <b>Documento:</b> {student.document}
          </p>
          <p>
            <b>Código:</b> {student.code}
          </p>

          <div>
            <label>
              <b>Email: </b>
            </label>
            <input
              className="border p-2 ml-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>
              <b>Fecha nacimiento: </b>
            </label>
            <input
              type="date"
              className="border p-2 ml-2"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>

          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>
      </div>
    </MainLayout>
  );
}