-- Reference Data for Medical Conditions and Medications
-- Using standard ICD-10 and RxNorm codes for HIPAA compliance

-- Common medical conditions (ICD-10 codes)
INSERT INTO medical_conditions_ref (icd10_code, name, category, description, severity_levels) VALUES
-- Cardiovascular
('I10', 'Essential Hypertension', 'Cardiovascular', 'High blood pressure without known cause', ARRAY['mild', 'moderate', 'severe']),
('I25.10', 'Atherosclerotic Heart Disease', 'Cardiovascular', 'Coronary artery disease', ARRAY['mild', 'moderate', 'severe']),
('I48.91', 'Atrial Fibrillation', 'Cardiovascular', 'Irregular heart rhythm', ARRAY['mild', 'moderate', 'severe']),

-- Metabolic/Endocrine
('E11.9', 'Type 2 Diabetes Mellitus', 'Endocrine', 'Non-insulin dependent diabetes', ARRAY['mild', 'moderate', 'severe']),
('E78.5', 'Hyperlipidemia', 'Endocrine', 'High cholesterol/lipids', ARRAY['mild', 'moderate', 'severe']),
('E66.9', 'Obesity', 'Endocrine', 'BMI ≥30 kg/m²', ARRAY['mild', 'moderate', 'severe']),
('E03.9', 'Hypothyroidism', 'Endocrine', 'Underactive thyroid', ARRAY['mild', 'moderate', 'severe']),

-- Mental Health
('F32.9', 'Major Depressive Disorder', 'Mental Health', 'Clinical depression', ARRAY['mild', 'moderate', 'severe']),
('F41.9', 'Anxiety Disorder', 'Mental Health', 'Generalized anxiety', ARRAY['mild', 'moderate', 'severe']),
('F33.9', 'Recurrent Depressive Disorder', 'Mental Health', 'Recurring episodes of depression', ARRAY['mild', 'moderate', 'severe']),

-- Musculoskeletal
('M25.50', 'Pain in Joint', 'Musculoskeletal', 'Joint pain unspecified', ARRAY['mild', 'moderate', 'severe']),
('M54.9', 'Dorsalgia', 'Musculoskeletal', 'Back pain', ARRAY['mild', 'moderate', 'severe']),
('M79.3', 'Panniculitis', 'Musculoskeletal', 'Inflammation of fat layer', ARRAY['mild', 'moderate', 'severe']),

-- Respiratory
('J45.9', 'Asthma', 'Respiratory', 'Chronic respiratory condition', ARRAY['mild', 'moderate', 'severe']),
('J44.1', 'COPD', 'Respiratory', 'Chronic obstructive pulmonary disease', ARRAY['mild', 'moderate', 'severe']),

-- Gastrointestinal
('K21.9', 'GERD', 'Gastrointestinal', 'Gastroesophageal reflux disease', ARRAY['mild', 'moderate', 'severe']),
('K58.9', 'IBS', 'Gastrointestinal', 'Irritable bowel syndrome', ARRAY['mild', 'moderate', 'severe']),

-- Sleep Disorders
('G47.00', 'Insomnia', 'Sleep', 'Difficulty sleeping', ARRAY['mild', 'moderate', 'severe']),
('G47.33', 'Sleep Apnea', 'Sleep', 'Breathing interruptions during sleep', ARRAY['mild', 'moderate', 'severe']),

-- Autoimmune/Inflammatory
('M06.9', 'Rheumatoid Arthritis', 'Autoimmune', 'Chronic inflammatory arthritis', ARRAY['mild', 'moderate', 'severe']),
('K50.90', 'Crohns Disease', 'Autoimmune', 'Inflammatory bowel disease', ARRAY['mild', 'moderate', 'severe']),

-- Neurological
('G43.909', 'Migraine', 'Neurological', 'Severe headaches', ARRAY['mild', 'moderate', 'severe']),
('G35', 'Multiple Sclerosis', 'Neurological', 'Autoimmune neurological condition', ARRAY['mild', 'moderate', 'severe']);

-- Common medications (RxNorm codes)
INSERT INTO medications_ref (rxnorm_code, name, generic_name, brand_names, dosage_forms, strength_units, category) VALUES
-- Cardiovascular medications
('308136', 'Lisinopril', 'lisinopril', ARRAY['Prinivil', 'Zestril'], ARRAY['tablet'], ARRAY['mg'], 'ACE Inhibitor'),
('161', 'Metoprolol', 'metoprolol', ARRAY['Lopressor', 'Toprol-XL'], ARRAY['tablet'], ARRAY['mg'], 'Beta Blocker'),
('29046', 'Amlodipine', 'amlodipine', ARRAY['Norvasc'], ARRAY['tablet'], ARRAY['mg'], 'Calcium Channel Blocker'),
('1114195', 'Atorvastatin', 'atorvastatin', ARRAY['Lipitor'], ARRAY['tablet'], ARRAY['mg'], 'Statin'),

-- Diabetes medications
('6809', 'Metformin', 'metformin', ARRAY['Glucophage'], ARRAY['tablet'], ARRAY['mg'], 'Biguanide'),
('274783', 'Insulin Glargine', 'insulin glargine', ARRAY['Lantus'], ARRAY['injection'], ARRAY['units'], 'Long-acting Insulin'),

-- Mental Health medications
('32937', 'Sertraline', 'sertraline', ARRAY['Zoloft'], ARRAY['tablet'], ARRAY['mg'], 'SSRI'),
('2556', 'Fluoxetine', 'fluoxetine', ARRAY['Prozac'], ARRAY['capsule', 'tablet'], ARRAY['mg'], 'SSRI'),
('2597', 'Alprazolam', 'alprazolam', ARRAY['Xanax'], ARRAY['tablet'], ARRAY['mg'], 'Benzodiazepine'),
('42347', 'Lorazepam', 'lorazepam', ARRAY['Ativan'], ARRAY['tablet'], ARRAY['mg'], 'Benzodiazepine'),

-- Pain/Anti-inflammatory
('1191', 'Aspirin', 'aspirin', ARRAY['Bayer'], ARRAY['tablet'], ARRAY['mg'], 'NSAID'),
('5640', 'Ibuprofen', 'ibuprofen', ARRAY['Advil', 'Motrin'], ARRAY['tablet', 'capsule'], ARRAY['mg'], 'NSAID'),
('7052', 'Acetaminophen', 'acetaminophen', ARRAY['Tylenol'], ARRAY['tablet', 'capsule'], ARRAY['mg'], 'Analgesic'),

-- Respiratory medications
('1998', 'Albuterol', 'albuterol', ARRAY['ProAir', 'Ventolin'], ARRAY['inhaler'], ARRAY['mcg'], 'Bronchodilator'),
('6851', 'Montelukast', 'montelukast', ARRAY['Singulair'], ARRAY['tablet'], ARRAY['mg'], 'Leukotriene Inhibitor'),

-- Gastrointestinal medications
('7646', 'Omeprazole', 'omeprazole', ARRAY['Prilosec'], ARRAY['capsule'], ARRAY['mg'], 'PPI'),
('2582', 'Famotidine', 'famotidine', ARRAY['Pepcid'], ARRAY['tablet'], ARRAY['mg'], 'H2 Blocker'),

-- Thyroid medications
('10582', 'Levothyroxine', 'levothyroxine', ARRAY['Synthroid', 'Levoxyl'], ARRAY['tablet'], ARRAY['mcg'], 'Thyroid Hormone'),

-- Sleep medications
('4493', 'Zolpidem', 'zolpidem', ARRAY['Ambien'], ARRAY['tablet'], ARRAY['mg'], 'Sleep Aid'),
('6960', 'Melatonin', 'melatonin', ARRAY[''], ARRAY['tablet', 'capsule'], ARRAY['mg'], 'Sleep Supplement'),

-- Vitamins/Supplements
('11170', 'Vitamin D3', 'cholecalciferol', ARRAY[''], ARRAY['tablet', 'capsule'], ARRAY['IU', 'mcg'], 'Vitamin'),
('6056', 'Vitamin B12', 'cyanocobalamin', ARRAY[''], ARRAY['tablet'], ARRAY['mcg'], 'Vitamin'),
('968', 'Multivitamin', 'multivitamin', ARRAY['Centrum'], ARRAY['tablet'], ARRAY[''], 'Vitamin'),

-- Autoimmune medications
('3008', 'Methotrexate', 'methotrexate', ARRAY['Rheumatrex'], ARRAY['tablet'], ARRAY['mg'], 'DMARD'),
('135056', 'Prednisone', 'prednisone', ARRAY[''], ARRAY['tablet'], ARRAY['mg'], 'Corticosteroid');