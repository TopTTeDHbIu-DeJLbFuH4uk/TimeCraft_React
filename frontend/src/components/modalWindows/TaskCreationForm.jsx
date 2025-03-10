import React, { useState, useEffect, useContext } from 'react';

import { TaskContext } from "../providers/TaskProvider";
import { CurrentTaskIdContext } from "../providers/TaskIdProvider";
import { SelectedTaskIdsContext } from "../providers/SelectedTaskIdsProvider";

import styles from "./TaskCreationForm.module.css";

const TaskCreationForm = ({ isClickBtnSave, setIsClickBtnSave, setIsModalOpen, isModalOpen }) => {
    const [ taskData, setTaskData ] = useState({
        title: '',
        description: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
    });

    const { taskList, setTaskList } = useContext(TaskContext);
    const { currentTaskId, setCurrentTaskId } = useContext(CurrentTaskIdContext);
    const { selectedTaskIds, setSelectedTaskIds } = useContext(SelectedTaskIdsContext);

    const createTask = task => {
        fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ task }),

        }).then(response => {
            return response.json();

        }).then(task => {
            setTaskList(prev => [ ...prev, task ]);
            setIsClickBtnSave(false);
            resetForm();
        });
    };

    const updateTask = (task, taskId) => {
        fetch(`http://localhost:5000/tasks/?taskId=${ taskId }`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({ task }),

        }).then(response => {
            return response.json();
        }).then(updateTask => {
            setTaskList(prevTasks => prevTasks.map(task => task.id === updateTask.id ? updateTask : task));
            setIsClickBtnSave(false);
            setSelectedTaskIds([]);
            resetForm();
        });
    };

    const resetForm = () => {
        setTaskData(prev => ({
            ...prev,
            title: '',
            description: '',
            endDate: '',
            endTime: '',
        }));
        setDefaultStartDatetime();
    };

    const handleSaveTask = () => {
        const startDatetime = new Date(`${ taskData.startDate } ${ taskData.startTime }`).toISOString();
        const endDatetime = taskData.endDate && taskData.endTime
            ? new Date(`${ taskData.endDate } ${ taskData.endTime }`).toISOString()
            : null;

        const task = {
            title: taskData.title,
            description: taskData.description,
            startDatetime,
            endDatetime,
        };

        if (selectedTaskIds.length) {
            updateTask(task, selectedTaskIds[0]);
        } else {
            createTask(task);
        }
    };

    useEffect(() => {
        if (!isClickBtnSave) return;
        handleSaveTask();
    }, [ isClickBtnSave ]);

    const setDefaultStartDatetime = () => {
        const currentDate = new Date();
        const defaultDate = currentDate.toISOString().slice(0, 10);

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const defaultTime = `${ hours }:${ minutes }`;

        setTaskData(prev => ({
            ...prev,
            startDate: defaultDate,
            startTime: defaultTime,
        }));
    };

    useEffect(() => setDefaultStartDatetime(), []);

    useEffect(() => {
        if (!currentTaskId) return;

        const task = currentTaskId[0];
        const {
            title,
            description,
            startDatetime,
            endDatetime,
        } = task;

        setIsModalOpen(true);

        setTaskData(() => ({
            title: title,
            description: description,
            startDate: startDatetime.split('T')[0],
            startTime: new Date(startDatetime).toTimeString().slice(0, 8),
            endDate: endDatetime.split('T')[0],
            endTime: new Date(endDatetime).toTimeString().slice(0, 8),
        }));

    }, [ currentTaskId ]);

    const handleChangeDate = (inputId, e) => {
        const currentYear = parseInt(e.target.value.slice(0, 4));

        switch (inputId) {
            case 'startDate':
                if (2100 < currentYear || 2000 > currentYear || !e.target.value) {
                    const defaultDate = new Date();

                    setTaskData(prev => ({
                        ...prev,
                        startDate: defaultDate.toISOString().slice(0, 10),
                    }));
                }
                break;
            case 'endDate':
                const minYear = parseInt(taskData.startDate.slice(0, 4));

                if (2100 < currentYear || minYear > currentYear) {
                    setTaskData(prev => ({
                        ...prev,
                        endDate: taskData.startDate,
                    }));
                }
                break;
            default:
        }
    };

    const handleChangeInput = e => {
        const { id, value } = e.target;
        setTaskData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    return (
        <form className={ styles.details }>
            <div className={ styles.inputGroup }>
                <label className={ styles.blockTitle } htmlFor="title">Название задачи:</label>
                <input
                    className={ styles.input }
                    type="text" placeholder="Задача"
                    id="title"
                    value={ taskData.title }
                    onChange={ handleChangeInput }
                />
            </div>

            <div className={ styles.inputGroup }>
                <label className={ styles.blockTitle } htmlFor="description">Описание:</label>
                <textarea
                    className={ styles.description }
                    placeholder="Описание"
                    id="description"
                    value={ taskData.description }
                    onChange={ handleChangeInput }
                />
            </div>

            <div className={ styles.inputGroup }>
                <label className={ styles.blockTitle } htmlFor="startDate">Дата начала:</label>
                <div className={ styles.dateGroup }>
                    <input
                        className={ styles.inputDatetime }
                        type="date"
                        min="2000-01-01"
                        max="2100-01-01"
                        id="startDate"
                        value={ taskData.startDate }
                        onChange={ handleChangeInput }
                        onBlur={ e => handleChangeDate('startDate', e) }
                    />
                    <input
                        className={ styles.inputDatetime }
                        type="time"
                        id="startTime"
                        value={ taskData.startTime }
                        onChange={ handleChangeInput }
                    />
                </div>
            </div>

            <div className={ styles.inputGroup }>
                <label className={ styles.blockTitle } htmlFor="endDatetime">Дата окончания:</label>
                <div className={ styles.dateGroup }>
                    <input
                        className={ styles.inputDatetime }
                        type="date"
                        max="2100-01-01"
                        id="endDate"
                        value={ taskData.endDate }
                        onChange={ handleChangeInput }
                        onBlur={ e => handleChangeDate('endDate', e) }
                    />
                    <input
                        className={ styles.inputDatetime }
                        type="time"
                        id="endTime"
                        value={ taskData.endTime }
                        onChange={ handleChangeInput }
                    />
                </div>
            </div>
        </form>
    );
};

export default TaskCreationForm;