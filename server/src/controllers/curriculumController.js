import Section from '../models/Section.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import Quiz from '../models/Quiz.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { parseYouTubeUrl } from '../utils/youtube.js';
import { loadOwnedCourse, refreshCourseCounters } from '../services/courseService.js';

async function ownedSection(sectionId, user) {
  const section = await Section.findById(sectionId);
  if (!section) throw new AppError('Section not found.', 404);
  const course = await loadOwnedCourse(section.course, user);
  return { section, course };
}
async function ownedLesson(lessonId, user) {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new AppError('Lesson not found.', 404);
  const course = await loadOwnedCourse(lesson.course, user);
  return { lesson, course };
}

// The ids must be exactly the current children, so a client cannot smuggle in another course's records.
async function applyOrder(Model, filter, ids) {
  const existing = (await Model.find(filter).distinct('_id')).map(String);
  if (existing.length !== ids.length || !ids.every((id) => existing.includes(id))) throw new AppError('The list of ids does not match the current items.', 400);
  await Model.bulkWrite(ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { order } } })));
}

export const createSection = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.courseId, req.user);
  const order = await Section.countDocuments({ course: course._id });
  const section = await Section.create({ course: course._id, title: req.body.title, order });
  return ok(res, { section }, 201);
});

export const updateSection = asyncHandler(async (req, res) => {
  const { section } = await ownedSection(req.params.sectionId, req.user);
  section.title = req.body.title;
  await section.save();
  return ok(res, { section });
});

export const deleteSection = asyncHandler(async (req, res) => {
  const { section, course } = await ownedSection(req.params.sectionId, req.user);
  const lessonIds = await Lesson.find({ section: section._id }).distinct('_id');
  await Promise.all([
    LessonProgress.deleteMany({ lesson: { $in: lessonIds } }),
    Quiz.updateMany({ lesson: { $in: lessonIds } }, { $unset: { lesson: 1 } }),
    Lesson.deleteMany({ section: section._id }),
  ]);
  await section.deleteOne();
  await refreshCourseCounters(course._id);
  return ok(res, { deleted: true });
});

export const reorderSections = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.courseId, req.user);
  await applyOrder(Section, { course: course._id }, req.body.ids);
  return ok(res, { reordered: true });
});

export const createLesson = asyncHandler(async (req, res) => {
  const { section, course } = await ownedSection(req.params.sectionId, req.user);
  const { videoId, isShort } = parseYouTubeUrl(req.body.youtubeUrl);
  const order = await Lesson.countDocuments({ section: section._id });
  const { title, description, durationMinutes, isPreview, resources } = req.body;
  const lesson = await Lesson.create({ course: course._id, section: section._id, title, description, durationMinutes, isPreview, resources, youtubeVideoId: videoId, isShort, order });
  await refreshCourseCounters(course._id);
  return ok(res, { lesson }, 201);
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { lesson, course } = await ownedLesson(req.params.lessonId, req.user);
  ['title', 'description', 'durationMinutes', 'isPreview', 'resources'].forEach((k) => { if (req.body[k] !== undefined) lesson[k] = req.body[k]; });
  if (req.body.youtubeUrl) {
    const { videoId, isShort } = parseYouTubeUrl(req.body.youtubeUrl);
    lesson.youtubeVideoId = videoId;
    lesson.isShort = isShort;
  }
  await lesson.save();
  await refreshCourseCounters(course._id);
  return ok(res, { lesson });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const { lesson, course } = await ownedLesson(req.params.lessonId, req.user);
  await Promise.all([LessonProgress.deleteMany({ lesson: lesson._id }), Quiz.updateMany({ lesson: lesson._id }, { $unset: { lesson: 1 } })]);
  await lesson.deleteOne();
  await refreshCourseCounters(course._id);
  return ok(res, { deleted: true });
});

export const reorderLessons = asyncHandler(async (req, res) => {
  const { section } = await ownedSection(req.params.sectionId, req.user);
  await applyOrder(Lesson, { section: section._id }, req.body.ids);
  return ok(res, { reordered: true });
});
