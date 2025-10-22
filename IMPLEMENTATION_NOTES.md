# Implementation Notes - Remaining Tasks

## 1. Detail Prompt - Multiple Triggers ✅ COMPLETE

### What's Done:
- ✅ Database migration (009) to change `detail_prompt_trigger` from VARCHAR to JSONB array
- ✅ Backend model updated to use JSONB
- ✅ Pydantic schemas updated to `Optional[List[str]]`
- ✅ Frontend TypeScript interfaces updated to `string[] | null`
- ✅ Visual indicator (green badge) added to question cards
- ✅ Frontend Application Builder UI changed from dropdown to checkboxes
- ✅ Frontend Application Wizard updated to use `.includes()` for array checking (dropdown and checkbox types)
- ✅ Form initialization updated to use empty array `[]` instead of `null`
- ✅ Badge tooltips and info boxes updated to display multiple triggers

---

## 2. Headers as Separate Insertable Cards 🆕 NOT STARTED

### Current Implementation Problem:
Headers are currently a field on questions (`header_text`). User wants headers to be separate entities that can be inserted between questions, with visual indentation for questions below them.

### Proposed Solution:

#### Option A: New `application_headers` Table (RECOMMENDED)
Create a new table for headers that sit alongside questions in the order:

**Database Migration (010)**:
```sql
CREATE TABLE application_headers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES application_sections(id) ON DELETE CASCADE,
  header_text VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_headers_section ON application_headers(section_id);

-- Drop header_text from questions (no longer needed)
ALTER TABLE application_questions DROP COLUMN header_text;
```

**Backend Changes**:
1. Create `ApplicationHeader` model
2. Create CRUD endpoints for headers
3. Update `getSections` to return both questions AND headers sorted by `order_index`
4. Return as union type or separate array

**Frontend Changes**:
1. Add "Add Header" button in section (alongside "Add Question")
2. Header dialog (simple - just header text)
3. Display header cards (amber/yellow background, larger text, no action buttons except move/delete)
4. When rendering: Questions below a header get `ml-6` or `pl-6` class for indentation
5. Drag-and-drop works for both questions and headers

**UI Structure**:
```
Section: "Camper Information"
  [Add Question] [Add Header]

  1. First Name
  2. Last Name

  ━━━━ Home Address ━━━━ [↑] [↓] [✏️] [🗑️]
    3. Street Address      (indented)
    4. City                (indented)
    5. Zip Code            (indented)

  ━━━━ Medical Info ━━━━ [↑] [↓] [✏️] [🗑️]
    6. Allergies?          (indented)
    7. Medications?        (indented)
```

#### Option B: Keep as Question Field, Change UI Display
- Keep `header_text` on questions
- In UI, render header as separate card BEFORE the question
- When dragging/moving, header moves with question
- Simpler but less flexible

**Recommendation**: Go with Option A for better separation of concerns and UX.

---

## 3. Detail Prompt Visual Indicator ✅ COMPLETE

Already implemented:
- Green badge with FileText icon
- Shows in question card badge row
- Tooltip on hover
- Expanded info below badges showing trigger and prompt text

---

## Priority Order:

1. **URGENT**: Fix detail prompt UI (checkboxes for multiple triggers) - User is currently blocked
2. **HIGH**: Implement headers as separate cards - Better UX, user requested
3. **MEDIUM**: Test and validate all features work together

---

## Testing Checklist:

### Detail Prompts:
- [ ] **User to test**: Select multiple triggers (e.g., "Seldom" AND "Never") via checkboxes
- [ ] **User to test**: Detail textarea appears when ANY selected trigger is chosen
- [ ] **User to test**: Detail textarea hidden when non-trigger answer selected
- [ ] **User to test**: Detail response saves correctly with `{question_id}_detail` key
- [ ] **User to test**: Green badge shows on question card with all triggers listed
- [ ] **User to test**: Expanded info shows all selected triggers

### Headers (when implemented):
- [ ] Create header in section
- [ ] Questions below header are indented
- [ ] Move header up/down
- [ ] Move question from below header to above (removes indent)
- [ ] Delete header (questions remain, lose indent)
- [ ] Drag-and-drop works for headers
- [ ] Headers display in application wizard
- [ ] Multiple headers in one section work correctly
