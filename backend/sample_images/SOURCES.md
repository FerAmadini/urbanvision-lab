# Sample images — sources and licenses

Demo samples used to exercise the inference pipeline. No image was modified
beyond resizing at download time (Unsplash `?w=1280`).

| File | Source | License / terms |
|---|---|---|
| `escena_reciclables_01.jpg` | COCO val2017, id `000000018380` — <http://images.cocodataset.org/val2017/000000018380.jpg> | COCO dataset terms (images retain their original Flickr licenses; dataset released for non-commercial research). Demo/educational use only. |
| `escena_reciclables_02.jpg` | COCO val2017, id `000000000632` — <http://images.cocodataset.org/val2017/000000000632.jpg> | Same as above. |
| `escena_voluminosos_01.jpg` | COCO val2017, id `000000039769` — <http://images.cocodataset.org/val2017/000000039769.jpg> | Same as above. |
| `escena_objetos_01.jpg` | COCO val2017, id `000000009448` — <http://images.cocodataset.org/val2017/000000009448.jpg> | Same as above. |
| `contenedores_01.jpg` | Unsplash, photo `1532996122724-e3c354a0b15b` — <https://images.unsplash.com/photo-1532996122724-e3c354a0b15b> | Unsplash License (free for commercial and non-commercial use). |
| `contenedores_02.jpg` | Unsplash, photo `1611284446314-60a58ac0deb9` — <https://images.unsplash.com/photo-1611284446314-60a58ac0deb9> | Unsplash License. |
| `contenedores_03.jpg` | Unsplash, photo `1604187351574-c75ca79f5807` — <https://images.unsplash.com/photo-1604187351574-c75ca79f5807> | Unsplash License. |

## Expected behaviour (documented on purpose)

- `escena_*` images contain COCO classes inside the curated urban subset
  (cups, wine glasses, dining table, bottle, couch, umbrella, bed, potted
  plant), so they produce detections and let the audit flow be demonstrated.
- `contenedores_*` images show real recycling bins. The pretrained COCO model
  produces **zero detections** on them because COCO has no "waste bin" or
  "trash" class. This is intentional: it makes the demo's core limitation
  visible — a production urban-waste model requires a custom dataset with
  the organization's own classes, which is exactly the work Asociación
  Sustentar already has in progress.
