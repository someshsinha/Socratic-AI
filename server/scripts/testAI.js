import { generateCoursePrompt, generateLessonPrompt } from '../services/aiService.js';

const runTests = async () => {
    console.log('--- Testing Stage 1: Course Generation ---');
    const courseResult = await generateCoursePrompt('React Hooks and State Management');
    console.log('Course Output:', JSON.stringify(courseResult, null, 2));

    if (courseResult.success) {
        const firstModule = courseResult.data.modules[0];
        const firstLessonTitle = firstModule.lessons[0];

        console.log('\n--- Testing Stage 2: Lazy Lesson Generation ---');
        const lessonResult = await generateLessonPrompt(
            courseResult.data.title,
            firstModule.title,
            firstLessonTitle
        );
        console.log('Lesson Output:', JSON.stringify(lessonResult, null, 2));
    }
};

runTests();