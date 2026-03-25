import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'Admin123!';

function suffix(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

test.describe('Aulas y horarios (e2e)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesi[oó]n/i })).toBeVisible();
    await page.getByLabel(/usuario/i).fill(ADMIN_USER);
    await page.getByLabel(/contrase[nñ]a/i).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('crea, edita y elimina aulas y horarios', async ({ page }) => {
    const code1 = `LAB-${suffix()}`;
    const code2 = `LAB-${suffix()}`;
    const createdSlot = 'Viernes 18:00-20:00';
    const updatedSlot = 'Sábado 07:00-09:00';

    await page.goto('/aulas');
    await expect(page.getByRole('heading', { name: /aulas/i })).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code1);
    await page.getByLabel(/edificio/i).fill('Bloque E');
    await page.getByLabel(/capacidad/i).fill('45');
    await page.getByRole('button', { name: /crear aula/i }).click();

    const classroomRow1 = page.locator('tbody tr').filter({ hasText: code1 });
    await expect(classroomRow1).toBeVisible();

    await page.getByLabel(/codigo/i).fill(code2);
    await page.getByLabel(/edificio/i).fill('Bloque F');
    await page.getByLabel(/capacidad/i).fill('60');
    await page.getByRole('button', { name: /crear aula/i }).click();

    const classroomRow2 = page.locator('tbody tr').filter({ hasText: code2 });
    await expect(classroomRow2).toBeVisible();

    await page.goto('/horarios');
    await expect(page.getByRole('heading', { name: /horarios/i })).toBeVisible();

    await page.getByLabel(/curso/i).selectOption({ label: 'MAT - MATEMATICA' });
    await page.getByLabel(/d[ií]a/i).selectOption('Viernes');
    await page.getByLabel(/hora inicio/i).fill('18:00');
    await page.getByLabel(/hora fin/i).fill('20:00');
    await page.getByLabel(/^aula$/i).selectOption({ label: `${code1} - Bloque E` });
    await page.getByRole('button', { name: /crear horario/i }).click();

    const scheduleRow = page.locator('tbody tr').filter({ hasText: createdSlot });
    await expect(scheduleRow).toBeVisible();
    await expect(scheduleRow).toContainText(code1);

    await scheduleRow.getByRole('button', { name: /editar/i }).click();
    await page.getByLabel(/d[ií]a/i).selectOption('Sábado');
    await page.getByLabel(/hora inicio/i).fill('07:00');
    await page.getByLabel(/hora fin/i).fill('09:00');
    await page.getByLabel(/^aula$/i).selectOption({ label: `${code2} - Bloque F` });
    await page.getByRole('button', { name: /actualizar horario/i }).click();

    const updatedRow = page.locator('tbody tr').filter({ hasText: updatedSlot });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText(code2);

    page.once('dialog', (dialog) => dialog.accept());
    await updatedRow.getByRole('button', { name: /eliminar/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: updatedSlot })).toHaveCount(0);

    await page.goto('/aulas');

    page.once('dialog', (dialog) => dialog.accept());
    await classroomRow2.getByRole('button', { name: /eliminar/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code2 })).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    await classroomRow1.getByRole('button', { name: /eliminar/i }).click();
    await expect(page.locator('tbody tr').filter({ hasText: code1 })).toHaveCount(0);
  });
});
