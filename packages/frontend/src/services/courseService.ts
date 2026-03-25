import { apiRequest } from '../lib';

export async function getCourses() {
  return await apiRequest('/courses');
}

export async function createCourse(data: {
  name: string;
  code: string;
  credits: number;
}) {

  return await apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCourse(id: string, data: any) {
  return await apiRequest(`/courses/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string) {
  return await apiRequest(`/courses/${id}`, {
    method: 'DELETE',
  });
}
