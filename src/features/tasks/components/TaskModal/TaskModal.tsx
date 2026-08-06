import { useState } from 'react';
import { useTasksUI } from '../../context/TasksUIContext';
import { useCreateTask } from '../../hooks/useCreateTask';
import { useUsers } from '../../hooks/useUsers';
import { PointEstimate, Status, TaskTag } from '../../types';
import styles from './TaskModal.module.css';

export interface FormState {
  name: string;
  status: Status;
  pointEstimate: PointEstimate | '';
  dueDate: string;
  tags: TaskTag[];
  assigneeId: string;
}

const initialFormState: FormState = {
  name: '',
  status: 'BACKLOG',
  pointEstimate: '',
  dueDate: '',
  tags: [],
  assigneeId: '',
};

const POINT_ESTIMATE_OPTIONS = Object.values(PointEstimate);
const TAG_OPTIONS = Object.values(TaskTag);
const STATUS_OPTIONS = Object.values(Status);

export function TaskModal() {
  const { dispatch } = useTasksUI();
  const { createTask, loading } = useCreateTask();
  const { users } = useUsers();
  const [form, setForm] = useState(initialFormState);

  const isFormValid =
    form.name.trim() !== '' &&
    form.pointEstimate !== '' &&
    form.dueDate !== '' &&
    form.tags.length > 0;

  const handleSubmit = async () => {
    await createTask({
      variables: {
        input: {
          name: form.name,
          status: form.status,
          pointEstimate: form.pointEstimate,
          dueDate: form.dueDate,
          tags: form.tags,
          assigneeId: form.assigneeId || undefined,
        },
      },
    });
    dispatch({ type: 'CLOSE_MODAL' });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <input
          placeholder="Task Title"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className={styles.titleInput}
        />
        <div className={styles.pickers}>
          <label>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Status }))}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Estimate
            <select
              value={form.pointEstimate}
              onChange={(e) => setForm((prev) => ({ ...prev, pointEstimate: e.target.value as PointEstimate }))}
            >
              <option value="">Select Estimate</option>
              {POINT_ESTIMATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <select
              value={form.assigneeId}
              onChange={(e) => setForm((prev) => ({ ...prev, assigneeId: e.target.value }))}
            >
              <option value="">Select Assignee</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span>Label</span>
            <div className={styles.tags}>
              {TAG_OPTIONS.map((tag) => (
                <label key={tag}>
                  <input
                    type="checkbox"
                    checked={form.tags.includes(tag)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
                      } else {
                        setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
                      }
                    }}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          <label>
            Due Date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <button onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={styles.createButton}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
