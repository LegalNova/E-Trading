"""Sectores normalizados (11 sectores GICS, en español) a partir de los nombres variados de cada fuente."""

RULES = [
    ('Inmobiliario', ['real estate', 'propert', 'reit', 'investment trust', 'collective invest']),
    ('Salud', ['health', 'pharma', 'biotech', 'medical', 'drug retailing']),
    ('Financiero', ['financ', 'bank', 'insurance', 'finance']),
    ('Tecnología', ['information tech', 'technology', 'software', 'semiconductor', 'electronic', ' it', 'it']),
    ('Comunicaciones', ['communication', 'telecom', 'media', 'mobile']),
    ('Energía', ['oil', 'gas', 'energy', 'solar', 'drilling', 'fuels']),
    ('Servicios públicos', ['utilit', 'power']),
    ('Materiales', ['material', 'mining', 'metal', 'steel', 'chemical', 'aluminum', 'fertilizer', 'basic resources']),
    ('Consumo básico', ['staples', 'beverage', 'tobacco', 'food', 'fast moving', 'consumer defensive', 'grocery', 'farming', 'household', 'personal care']),
    ('Consumo discrecional', ['discretionary', 'consumer', 'retail', 'automo', 'auto ', 'travel', 'leisure', 'tourism', 'gambling', 'e-commerce', 'clothes', 'personal goods', 'homebuilding', 'hospitality', 'durables']),
    ('Industria', ['industr', 'aerospace', 'defence', 'construct', 'engineering', 'machinery', 'shipbuilding', 'marine', 'airline', 'aviation', 'logistic', 'distribution', 'infrastructure', 'manufactur', 'capital goods', 'support services', 'services', 'commerce']),
]


def canon_sector(raw: str) -> str:
    s = (raw or '').strip().lower()
    if not s:
        return ''
    if s == 'it':
        return 'Tecnología'
    for name, keys in RULES:
        if any(k.strip() in s if k.strip() != 'it' else False for k in keys):
            return name
    return ''
