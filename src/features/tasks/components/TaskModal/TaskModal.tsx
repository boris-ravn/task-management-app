import { useState } from 'react';
import { useTasksUI } from '../../context/TasksUIContext';
import { useToast } from '../../../../context/ToastContext/ToastContext';
import { logError } from '../../../../lib/error-logger';
import { useCreateTask } from '../../hooks/useCreateTask';
import { useUpdateTask } from '../../hooks/useUpdateTask';
import { useUsers } from '../../hooks/useUsers';
import { PointEstimate, Status, TaskTag } from '../../types';
import { EstimateIcon } from '../../../../components/ui/icons/EstimateIcon';
import { AssigneeIcon } from '../../../../components/ui/icons/AssigneeIcon';
import { LabelIcon } from '../../../../components/ui/icons/LabelIcon';
import { DueDateIcon } from '../../../../components/ui/icons/DueDateIcon';
import { ListIcon } from '../../../../components/ui/icons/ListIcon';
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
  const { state, dispatch } = useTasksUI();
  const { showToast } = useToast();
  const { createTask, loading: createLoading } = useCreateTask();
  const { updateTask, loading: updateLoading } = useUpdateTask();
  const { users } = useUsers();

  const editingTask = state.modal.mode === 'edit' ? state.modal.task : undefined;
  const isEditMode = editingTask !== undefined;

  const [form, setForm] = useState<FormState>(() => {
    if (editingTask) {
      return {
        name: editingTask.name,
        status: editingTask.status,
        pointEstimate: editingTask.pointEstimate,
        dueDate: editingTask.dueDate.split('T')[0],
        tags: [...editingTask.tags],
        assigneeId: editingTask.assignee?.id || '',
      };
    }
    return initialFormState;
  });

  const [openPicker, setOpenPicker] = useState<string | null>(null);

  const togglePicker = (name: string) => {
    setOpenPicker((prev) => (prev === name ? null : name));
  };

  const isFormValid =
    form.name.trim() !== '' &&
    form.pointEstimate !== '' &&
    form.dueDate !== '' &&
    form.tags.length > 0;

  const handleSubmit = async () => {
    const input = {
      name: form.name,
      status: form.status,
      pointEstimate: form.pointEstimate,
      dueDate: form.dueDate,
      tags: form.tags,
      assigneeId: form.assigneeId || undefined,
    };

    if (isEditMode) {
      try {
        await updateTask({ variables: { input: { id: editingTask.id, ...input } } });
        showToast('success', 'Task updated');
        dispatch({ type: 'CLOSE_MODAL' });
      } catch (error) {
        logError(error, { action: 'updateTask', taskId: editingTask.id });
        showToast('error', 'Could not update task');
      }
      return;
    }

    try {
      await createTask({ variables: { input } });
      showToast('success', 'Task created');
      dispatch({ type: 'CLOSE_MODAL' });
    } catch (error) {
      logError(error, { action: 'createTask' });
      showToast('error', 'Could not create task');
    }
  };

  const selectedAssignee = users.find((u) => u.id === form.assigneeId);

  return (
    <div className={styles.overlay} onClick={() => setOpenPicker(null)}>
      <div className={styles.modal} onClick={(e) => { e.stopPropagation(); setOpenPicker(null); }}>
        <input
          placeholder="Task Title"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className={styles.titleInput}
        />
        <div className={styles.pickers} onClick={(e) => e.stopPropagation()}>

          <div className={styles.pickerWrapper}>
            <button type="button" className={styles.pickerButton} onClick={() => togglePicker('status')}>
              <ListIcon />
              <span>{form.status}</span>
            </button>
            {openPicker === 'status' && (
              <ul className={styles.dropdown}>
                {STATUS_OPTIONS.map((option) => (
                  <li
                    key={option}
                    className={`${styles.dropdownItem} ${form.status === option ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setForm((prev) => ({ ...prev, status: option })); setOpenPicker(null); }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.pickerWrapper}>
            <button type="button" className={styles.pickerButton} onClick={() => togglePicker('estimate')}>
              <EstimateIcon />
              <span>{form.pointEstimate || 'Estimate'}</span>
            </button>
            {openPicker === 'estimate' && (
              <ul className={styles.dropdown}>
                {POINT_ESTIMATE_OPTIONS.map((option) => (
                  <li
                    key={option}
                    className={`${styles.dropdownItem} ${form.pointEstimate === option ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setForm((prev) => ({ ...prev, pointEstimate: option })); setOpenPicker(null); }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.pickerWrapper}>
            <button type="button" className={styles.pickerButton} onClick={() => togglePicker('assignee')}>
              <AssigneeIcon />
              <span>{selectedAssignee?.fullName || 'Assignee'}</span>
            </button>
            {openPicker === 'assignee' && (
              <ul className={styles.dropdown}>
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={`${styles.dropdownItem} ${form.assigneeId === user.id ? styles.dropdownItemActive : ''}`}
                    onClick={() => { setForm((prev) => ({ ...prev, assigneeId: user.id })); setOpenPicker(null); }}
                  >
                    {user.fullName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.pickerWrapper}>
            <button type="button" className={styles.pickerButton} onClick={() => togglePicker('label')}>
              <LabelIcon />
              <span>
                {form.tags.length === 0
                  ? 'Label'
                  : form.tags.length === 1
                    ? form.tags[0]
                    : `${form.tags.length} Labels`}
              </span>
            </button>
            {openPicker === 'label' && (
              <ul className={styles.dropdown}>
                {TAG_OPTIONS.map((tag) => (
                  <li key={tag} className={styles.dropdownItem}>
                    <label className={styles.checkboxItem}>
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
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.pickerWrapper}>
            <button type="button" className={styles.pickerButton} onClick={() => togglePicker('dueDate')}>
              <DueDateIcon />
              <span>{form.dueDate || 'Due Date'}</span>
            </button>
            {openPicker === 'dueDate' && (
              <div className={styles.dropdown}>
                <input
                  type="date"
                  value={form.dueDate}
                  className={styles.dateInput}
                  autoFocus
                  onChange={(e) => { setForm((prev) => ({ ...prev, dueDate: e.target.value })); setOpenPicker(null); }}
                />
              </div>
            )}
          </div>

        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => dispatch({ type: 'CLOSE_MODAL' })}>Cancel</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || createLoading || updateLoading}
            className={styles.createButton}
          >
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
