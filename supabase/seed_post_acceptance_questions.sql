-- Seed Post-Acceptance Questions
-- These sections/questions only appear after an application is accepted

-- Create a new section: "Post-Acceptance Information"
INSERT INTO application_sections (
    title,
    description,
    order_index,
    show_when_status
) VALUES (
    'Post-Acceptance Information',
    'Additional information needed now that your camper has been accepted to CAMP FASD.',
    18,  -- After the existing 17 sections
    'accepted'  -- Only show when status = 'accepted'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Get the section ID
DO $$
DECLARE
    post_acceptance_section_id UUID;
BEGIN
    -- Get the post-acceptance section ID
    SELECT id INTO post_acceptance_section_id
    FROM application_sections
    WHERE title = 'Post-Acceptance Information'
    LIMIT 1;

    -- Only proceed if section exists
    IF post_acceptance_section_id IS NOT NULL THEN

        -- Question 1: Travel Arrangements
        INSERT INTO application_questions (
            section_id,
            question_text,
            question_type,
            options,
            help_text,
            is_required,
            order_index,
            show_when_status
        ) VALUES (
            post_acceptance_section_id,
            'How will your camper be traveling to camp?',
            'dropdown',
            '["Parent/Guardian Drop-off", "Flying - Need Airport Pickup", "Bus/Van Service", "Other"]',
            'We need to coordinate pickup/dropoff logistics',
            true,
            1,
            'accepted'
        );

        -- Question 2: T-Shirt Size
        INSERT INTO application_questions (
            section_id,
            question_text,
            question_type,
            options,
            help_text,
            is_required,
            order_index,
            show_when_status
        ) VALUES (
            post_acceptance_section_id,
            'What is your camper''s t-shirt size?',
            'dropdown',
            '["Youth Small", "Youth Medium", "Youth Large", "Adult Small", "Adult Medium", "Adult Large", "Adult XL", "Adult 2XL"]',
            'For the official CAMP FASD t-shirt',
            true,
            2,
            'accepted'
        );

        -- Question 3: Dietary Restrictions
        INSERT INTO application_questions (
            section_id,
            question_text,
            question_type,
            help_text,
            is_required,
            order_index,
            show_when_status
        ) VALUES (
            post_acceptance_section_id,
            'Does your camper have any dietary restrictions or food allergies?',
            'textarea',
            'Please list any allergies, religious restrictions, or dietary preferences',
            false,
            3,
            'accepted'
        );

        -- Question 4: Special Equipment/Accommodations
        INSERT INTO application_questions (
            section_id,
            question_text,
            question_type,
            help_text,
            is_required,
            order_index,
            show_when_status
        ) VALUES (
            post_acceptance_section_id,
            'Will your camper need any special equipment or accommodations?',
            'textarea',
            'Examples: wheelchair, CPAP machine, special bedding, etc.',
            false,
            4,
            'accepted'
        );

        -- Question 5: Emergency Contact During Camp
        INSERT INTO application_questions (
            section_id,
            question_text,
            question_type,
            help_text,
            is_required,
            order_index,
            show_when_status
        ) VALUES (
            post_acceptance_section_id,
            'Primary contact phone number during camp week',
            'phone',
            'The best number to reach you while your camper is at camp',
            true,
            5,
            'accepted'
        );

    END IF;
END $$;

-- Verify the post-acceptance questions were created
SELECT
    s.title as section,
    q.question_text,
    q.question_type,
    q.is_required,
    q.show_when_status
FROM application_questions q
JOIN application_sections s ON q.section_id = s.id
WHERE q.show_when_status = 'accepted'
ORDER BY s.order_index, q.order_index;
