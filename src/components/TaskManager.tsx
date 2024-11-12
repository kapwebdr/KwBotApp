import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { Task, TaskCategory } from '../types/tasks';
import { taskService } from '../services/taskService';
import { BottomBar } from './BottomBar';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { LoadingBubble } from './LoadingBubble';
import { AddTaskModal } from './AddTaskModal';
import { taskCategoryService } from '../services/taskCategoryService';
import { Categories } from './Categories';
import { useTool } from '../hooks/useTool';
import { CalendarEvent } from '../types/calendar';
import { calendarService } from '../services/calendarService';
import { ScheduleTaskModal } from './ScheduleTaskModal';

export const TaskManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const bottomPadding = useBottomPadding();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const { setToolHeight } = useTool();
  const [taskEvents, setTaskEvents] = useState<Record<string, CalendarEvent>>({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await taskService.listTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setToolHeight(0);
    loadTasks();
  }, [loadTasks]);

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus, updatedAt: new Date().toISOString() };
    const success = await taskService.updateTask(updatedTask);

    if (success) {
      await loadTasks();
    }
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setShowAddModal(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    const success = await taskService.deleteTask(taskId);
    if (success) {
      await loadTasks();
    }
  };

  const filteredTasks = tasks.filter(task => 
    selectedCategory === 'all' || selectedCategory === null || task.category === selectedCategory
  );

  const loadCategories = useCallback(async () => {
    const loadedCategories = await taskCategoryService.listCategories();
    setCategories(loadedCategories);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleScheduleTask = (task: Task) => {
    setTaskToSchedule(task);
    setShowScheduleModal(true);
  };

  // Charger les événements associés aux tâches
  const loadTaskEvents = useCallback(async () => {
    const events: Record<string, CalendarEvent> = {};
    for (const task of tasks) {
      if (task.eventId) {
        const event = await calendarService.getEvent(task.eventId);
        if (event) {
          events[task.id] = event;
        }
      }
    }
    setTaskEvents(events);
  }, [tasks]);

  useEffect(() => {
    loadTaskEvents();
  }, [loadTaskEvents]);

  const renderTaskItem = (task: Task) => {
    const event = taskEvents[task.id];
    
    return (
      <View key={task.id} style={styles.taskItem}>
        <TouchableOpacity
          style={[
            styles.taskCheckbox,
            { borderColor: theme.colors.text },
            task.status === 'done' && { backgroundColor: theme.colors.success }
          ]}
          onPress={() => handleTaskStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
        >
          {task.status === 'done' && (
            <Ionicons name="checkmark" size={16} color={theme.colors.background} />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.taskContent}
          onPress={() => handleTaskClick(task)}
        >
          <Text 
            style={[
              styles.taskTitle,
              { color: theme.colors.text },
              task.status === 'done' && { textDecorationLine: 'line-through', opacity: 0.7 }
            ]}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text style={styles.taskDescription}>
              {task.description}
            </Text>
          )}
          <View style={styles.taskMeta}>
            <View style={[
              styles.priorityBadge,
              {
                backgroundColor: 
                  task.priority === 'high' ? `${theme.colors.error}20` :
                  task.priority === 'medium' ? `${theme.colors.warning}20` :
                  `${theme.colors.success}20`,
              }
            ]}>
              <Text style={[
                styles.priorityText,
                {
                  color: 
                    task.priority === 'high' ? theme.colors.error :
                    task.priority === 'medium' ? theme.colors.warning :
                    theme.colors.success,
                }
              ]}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Text>
            </View>

            {event && (
              <View style={styles.scheduleBadge}>
                <Ionicons name="calendar" size={12} color={theme.colors.primary} />
                <Text style={styles.scheduleText}>
                  {new Date(event.startDate).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleTaskDelete(task.id)}
          >
            <Ionicons name="trash" size={20} color={theme.colors.error} />
          </TouchableOpacity>
          {!task.eventId && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleScheduleTask(task)}
            >
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.taskManagerContainer}>
        <LoadingBubble message="Chargement des tâches..." />
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={styles.taskManagerContainer}>
      <View style={styles.taskManagerHeader}>
        <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
          Mes Tâches
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>

      <Categories
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showManageButton={true}
        onUpdate={loadCategories}
      />

      <View style={[styles.taskListContainer, { marginBottom: bottomPadding }]}>
        <ScrollView
          style={styles.taskList}
          showsVerticalScrollIndicator={false}
        >
          {filteredTasks.map(renderTaskItem)}
        </ScrollView>
      </View>

      <AddTaskModal
        isVisible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTask(null);
        }}
        onAdd={loadTasks}
        categories={categories}
        task={editingTask}
      />

      <ScheduleTaskModal
        isVisible={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        task={taskToSchedule!}
        onScheduled={() => {
          loadTasks();
          loadTaskEvents();
        }}
      />

      <BottomBar />
    </View>
  );
};

export default TaskManager;