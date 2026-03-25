import { test, expect } from '@playwright/test';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function randomScheduleData() {
  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const randomMinute =
    minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  const startHour = String(6 + Math.floor(Math.random() * 12)).padStart(2, '0');
  const endHour = String(Number(startHour) + 2).padStart(2, '0');

  return {
    day: 'Domingo',
    startTime: `${startHour}:${randomMinute}`,
    endTime: `${endHour}:${randomMinute}`,
    slot: `Domingo ${startHour}:${randomMinute}-${endHour}:${randomMinute}`,
  };
}

test.describe('Creación de horario (e2e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: /iniciar sesi[oó]n/i }),
    ).toBeVisible();
    await page.getByLabel(/usuario/i).fill(ADMIN_USER);
    await page.getByLabel(/contrase[nñ]a/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('flujo completo: ir a registro, rellenar formulario, enviar y ver horario en la lista', async ({
    page,
  }) => {
    const { day, startTime, endTime, slot } = randomScheduleData();

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
    await page.getByRole('button', { name: /agregar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ index: 1 });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(day);
    await page.getByLabel(/hora de inicio/i).fill(startTime);
    await page.getByLabel(/hora de fin/i).fill(endTime);

    await page.getByRole('button', { name: /registrar horario/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();

    const scheduleRow = page.locator('tbody tr').filter({ hasText: slot });
    await expect(scheduleRow).toBeVisible();
  });

  test('validación: no permite enviar sin campos obligatorios', async ({
    page,
  }) => {
    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(page.getByLabel(/curso/i)).toHaveAttribute('required', '');
    await expect(page.getByLabel(/aula/i)).toHaveAttribute('required', '');
    await expect(
      page.getByLabel(/dia de la semana|d[ií]a de la semana/i),
    ).toHaveAttribute('required', '');
    await expect(page.getByLabel(/hora de inicio/i)).toHaveAttribute(
      'required',
      '',
    );
    await expect(page.getByLabel(/hora de fin/i)).toHaveAttribute(
      'required',
      '',
    );
  });

  test('validación: hora de fin debe ser mayor que hora de inicio', async ({
    page,
  }) => {
    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ index: 1 });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('15:00');
    await page.getByLabel(/hora de fin/i).fill('14:00');

    await page.getByRole('button', { name: /registrar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);
    await expect(
      page.getByText('La hora de fin debe ser mayor que la hora de inicio'),
    ).toBeVisible();
  });

  test('cancelar vuelve a la lista sin crear horario', async ({ page }) => {
    await page.goto('/horarios/registro');
    await expect(
      page.getByRole('heading', { name: /agregar horario/i }),
    ).toBeVisible();

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ index: 1 });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption('Lunes');
    await page.getByLabel(/hora de inicio/i).fill('10:00');
    await page.getByLabel(/hora de fin/i).fill('12:00');

    await page.getByRole('button', { name: /cancelar/i }).click();
    await expect(page).toHaveURL(/\/horarios$/);
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
  });
});
