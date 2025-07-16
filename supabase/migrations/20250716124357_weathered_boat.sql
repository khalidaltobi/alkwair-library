/*
  # مخطط قاعدة البيانات لمركز مصادر التعلم

  1. الجداول الجديدة
    - `categories` - فئات المصادر التعليمية
      - `id` (uuid, primary key)
      - `name` (text) - اسم الفئة
      - `description` (text) - وصف الفئة
      - `icon` (text) - أيقونة الفئة
      - `color` (text) - لون الفئة
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `resources` - المصادر التعليمية
      - `id` (uuid, primary key)
      - `title` (text) - عنوان المصدر
      - `description` (text) - وصف المصدر
      - `content` (text) - محتوى المصدر
      - `type` (text) - نوع المصدر (كتاب، فيديو، مقال، إلخ)
      - `category_id` (uuid, foreign key)
      - `author` (text) - المؤلف
      - `file_url` (text) - رابط الملف
      - `thumbnail_url` (text) - رابط الصورة المصغرة
      - `tags` (text[]) - العلامات
      - `difficulty_level` (text) - مستوى الصعوبة
      - `language` (text) - اللغة
      - `is_featured` (boolean) - مميز
      - `is_published` (boolean) - منشور
      - `views_count` (integer) - عدد المشاهدات
      - `downloads_count` (integer) - عدد التحميلات
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_favorites` - المفضلة للمستخدمين
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `resource_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `user_progress` - تقدم المستخدمين
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `resource_id` (uuid, foreign key)
      - `progress_percentage` (integer)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للقراءة والكتابة حسب المستخدم

  3. الفهارس
    - فهارس للبحث السريع والاستعلامات المحسنة
*/

-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  color text DEFAULT '#673DE6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المصادر التعليمية
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text,
  type text NOT NULL DEFAULT 'document',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author text,
  file_url text,
  thumbnail_url text,
  tags text[] DEFAULT '{}',
  difficulty_level text DEFAULT 'متوسط',
  language text DEFAULT 'العربية',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  views_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- إنشاء جدول تقدم المستخدمين
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان للفئات (قراءة عامة)
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Categories can be managed by authenticated users"
  ON categories
  FOR ALL
  TO authenticated
  USING (true);

-- سياسات الأمان للمصادر
CREATE POLICY "Published resources are viewable by everyone"
  ON resources
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own unpublished resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR is_published = true);

CREATE POLICY "Users can create resources"
  ON resources
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own resources"
  ON resources
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own resources"
  ON resources
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- سياسات الأمان للمفضلة
CREATE POLICY "Users can manage their own favorites"
  ON user_favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- سياسات الأمان لتقدم المستخدمين
CREATE POLICY "Users can manage their own progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- إنشاء الفهارس للأداء المحسن
CREATE INDEX IF NOT EXISTS idx_resources_category_id ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_resources_is_published ON resources(is_published);
CREATE INDEX IF NOT EXISTS idx_resources_is_featured ON resources(is_featured);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_resource_id ON user_favorites(resource_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_resource_id ON user_progress(resource_id);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء المشغلات لتحديث updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();