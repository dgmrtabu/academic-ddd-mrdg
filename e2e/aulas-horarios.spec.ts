import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function suffix(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

function uniqueSchedulePair() {
  const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
  const createdMinute =
    minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  const updatedMinute =
    minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  const createdHour = String(6 + Math.floor(Math.random() * 6)).padStart(2, '0');
  const updatedHour = String(13 + Math.floor(Math.random() * 6)).padStart(2, '0');
  const createdEndHour = String(Number(createdHour) + 2).padStart(2, '0');
  const updatedEndHour = String(Number(updatedHour) + 2).padStart(2, '0');

  return {
    created: {
      day: 'Domingo',
      start: `${createdHour}:${createdMinute}`,
      end: `${createdEndHour}:${createdMinute}`,
      slot: `Domingo ${createdHour}:${createdMinute}-${createdEndHour}:${createdMinute}`,
    },
    updated: {
      day: 'Sábado',
      start: `${updatedHour}:${updatedMinute}`,
      end: `${updatedEndHour}:${updatedMinute}`,
      slot: `Sábado ${updatedHour}:${updatedMinute}-${updatedEndHour}:${updatedMinute}`,
    },
  };
}

test.describe('Aulas y horarios (e2e)', () => {
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

  test('crea, edita y elimina aulas y horarios', async ({ page }) => {
    const code1 = `LAB-${suffix()}`;
    const code2 = `LAB-${suffix()}`;
    const schedulePair = uniqueSchedulePair();

    await page.goto('/aulas');
    await expect(page.getByRole('heading', { name: /aulas/i })).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code1);
    await page.getByLabel(/edificio/i).fill('Bloque E');
    await page.getByLabel(/capacidad/i).fill('45');
    await page.getByRole('button', { name: /crear aula/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code1 })).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code2);
    await page.getByLabel(/edificio/i).fill('Bloque F');
    await page.getByLabel(/capacidad/i).fill('60');
    await page.getByRole('button', { name: /crear aula/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code2 })).toBeVisible();

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();
    await page.getByRole('button', { name: /agregar horario/i }).click();
    await expect(page).toHaveURL(/\/horarios\/registro/);

    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page.getByLabel(/curso/i).selectOption({ index: 1 });
    await page.getByLabel(/aula/i).selectOption({ label: `${code1} - Bloque E` });
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(schedulePair.created.day);
    await page.getByLabel(/hora de inicio/i).fill(schedulePair.created.start);
    await page.getByLabel(/hora de fin/i).fill(schedulePair.created.end);
    await page.getByRole('button', { name: /registrar horario/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);

    const scheduleRow = page
      .locator('tbody tr')
      .filter({ hasText: schedulePair.created.slot })
      .filter({ hasText: code1 });
    await expect(scheduleRow).toBeVisible();

    await scheduleRow.getByRole('button', { name: /editar/i }).click();
    await expect(page).toHaveURL(/\/horarios\/.+\/editar$/);
    await expect(page.getByLabel(/curso/i)).toBeEnabled();
    await expect(page.locator('#course option')).toHaveCount(4);
    await expect(page.getByLabel(/aula/i)).toBeEnabled();
    await page
      .getByLabel(/dia de la semana|d[ií]a de la semana/i)
      .selectOption(schedulePair.updated.day);
    await page.getByLabel(/hora de inicio/i).fill(schedulePair.updated.start);
    await page.getByLabel(/hora de fin/i).fill(schedulePair.updated.end);
    await page.getByLabel(/aula/i).selectOption({ label: `${code2} - Bloque F` });
    await page.getByRole('button', { name: /guardar cambios/i }).click();

    await expect(page).toHaveURL(/\/horarios$/);

    const updatedRow = page
      .locator('tbody tr')
      .filter({ hasText: schedulePair.updated.slot })
      .filter({ hasText: code2 });
    await expect(updatedRow).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await updatedRow.getByRole('button', { name: /eliminar/i }).click();
    await expect(
      page.locator('tbody tr').filter({ hasText: schedulePair.updated.slot }),
    ).toHaveCount(0);

    await page.goto('/aulas');

    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('tbody tr')
      .filter({ hasText: code2 })
      .getByRole('button', { name: /eliminar/i })
      .click();
    await expect(page.locator('tbody tr').filter({ hasText: code2 })).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    await page
      .locator('tbody tr')
      .filter({ hasText: code1 })
      .getByRole('button', { name: /eliminar/i })
      .click();
    await expect(page.locator('tbody tr').filter({ hasText: code1 })).toHaveCount(0);
  });
});
