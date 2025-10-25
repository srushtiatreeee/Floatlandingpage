/*
  # Add time tracking fields to tasks and subtasks

  1. Changes to tasks table
    - Add `estimated_hours` (numeric, default 1)
    - Add `actual_hours` (numeric, default 0)
    - Add `start_date` (timestamp, nullable)
    - Add `due_date` (timestamp, nullable)

  2. Changes to subtasks table
    - Add `estimated_hours` (numeric, default 0.5)
    - Add `actual_hours` (numeric, default 0)
    - Add `start_date` (timestamp, nullable)
    - Add `due_date` (timestamp, nullable)

  3. Notes
    - Estimated hours help users plan their timeline
    - Actual hours track real time spent
    - Dates help with scheduling and deadlines
*/

-- Add time tracking fields to tasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'estimated_hours'
  ) THEN
    ALTER TABLE tasks ADD COLUMN estimated_hours numeric DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'actual_hours'
  ) THEN
    ALTER TABLE tasks ADD COLUMN actual_hours numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN due_date timestamptz;
  END IF;
END $$;

-- Add time tracking fields to subtasks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'estimated_hours'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN estimated_hours numeric DEFAULT 0.5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'actual_hours'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN actual_hours numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN start_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subtasks' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE subtasks ADD COLUMN due_date timestamptz;
  END IF;
END $$;