"""Curated COCO class subset relevant to urban waste auditing.

YOLO11n is pretrained on COCO (80 classes). COCO has no dedicated
cardboard / can / plastic-bag classes, so the demo filters detections to
the subset below and groups them into three categories that mirror the
Sustentar use cases:

- recyclable: small recyclable materials and containers
- organic:    food waste
- bulky:      bulky items / urban hygiene incidents (dumped furniture,
              appliances, bicycles, etc.)

This mapping is deliberately a single editable constant: a production
deployment would replace it with the organization's real class taxonomy.
"""

URBAN_CLASSES: dict[str, str] = {
    # Recyclable materials
    "bottle": "recyclable",
    "wine glass": "recyclable",
    "cup": "recyclable",
    "fork": "recyclable",
    "knife": "recyclable",
    "spoon": "recyclable",
    "bowl": "recyclable",
    "backpack": "recyclable",
    "handbag": "recyclable",
    "suitcase": "recyclable",
    "umbrella": "recyclable",
    "scissors": "recyclable",
    "vase": "recyclable",
    "teddy bear": "recyclable",
    "toothbrush": "recyclable",
    "hair drier": "recyclable",
    "book": "recyclable",
    # Organic waste
    "apple": "organic",
    "orange": "organic",
    "banana": "organic",
    "sandwich": "organic",
    "pizza": "organic",
    "cake": "organic",
    "donut": "organic",
    # Bulky items / urban hygiene incidents
    "chair": "bulky",
    "couch": "bulky",
    "bed": "bulky",
    "dining table": "bulky",
    "toilet": "bulky",
    "tv": "bulky",
    "refrigerator": "bulky",
    "microwave": "bulky",
    "oven": "bulky",
    "toaster": "bulky",
    "sink": "bulky",
    "bicycle": "bulky",
    "potted plant": "bulky",
}

CATEGORIES: tuple[str, ...] = ("recyclable", "organic", "bulky")
