-- Données d'exemple pour tester le catalogue en local.
-- À NE PAS garder en production : à remplacer par le vrai catalogue du
-- client (voir "Catégories de produits réelles..." dans les points à
-- trancher, CLAUDE.md). Toutes les images pointent vers un placeholder
-- générique (public/img/placeholder-product.svg) tant que les photos
-- produit réelles ne sont pas fournies.

insert into public.categories (slug, name_fr, name_en, display_order) values
  ('vetements', 'Vêtements', 'Clothing', 1),
  ('accessoires', 'Accessoires', 'Accessories', 2),
  ('chaussures', 'Chaussures', 'Shoes', 3);

insert into public.products
  (slug, name_fr, name_en, description_fr, description_en, price, promo_price, category_id, stock, status, featured)
values
  (
    'exemple-tshirt-wax',
    'Exemple — T-shirt imprimé wax',
    'Example — Wax print T-shirt',
    'Produit de démonstration. Remplacer par la vraie description.',
    'Demo product. Replace with the real description.',
    12000, null,
    (select id from public.categories where slug = 'vetements'),
    25, 'active', true
  ),
  (
    'exemple-robe-ete',
    'Exemple — Robe d''été',
    'Example — Summer dress',
    'Produit de démonstration. Remplacer par la vraie description.',
    'Demo product. Replace with the real description.',
    25000, 19000,
    (select id from public.categories where slug = 'vetements'),
    10, 'active', true
  ),
  (
    'exemple-sac-a-main',
    'Exemple — Sac à main tissé',
    'Example — Woven handbag',
    'Produit de démonstration. Remplacer par la vraie description.',
    'Demo product. Replace with the real description.',
    18000, null,
    (select id from public.categories where slug = 'accessoires'),
    0, 'active', false
  ),
  (
    'exemple-bijou-perles',
    'Exemple — Collier de perles',
    'Example — Beaded necklace',
    'Produit de démonstration. Remplacer par la vraie description.',
    'Demo product. Replace with the real description.',
    8000, null,
    (select id from public.categories where slug = 'accessoires'),
    40, 'active', true
  ),
  (
    'exemple-sandales-cuir',
    'Exemple — Sandales en cuir',
    'Example — Leather sandals',
    'Produit de démonstration. Remplacer par la vraie description.',
    'Demo product. Replace with the real description.',
    22000, null,
    (select id from public.categories where slug = 'chaussures'),
    15, 'active', false
  ),
  (
    'exemple-brouillon',
    'Exemple — Produit en brouillon',
    'Example — Draft product',
    'Ce produit est en statut brouillon : il ne doit pas apparaître dans le catalogue public.',
    'This product is in draft status: it should not appear in the public catalogue.',
    5000, null,
    (select id from public.categories where slug = 'chaussures'),
    5, 'draft', false
  );

insert into public.product_images (product_id, url, display_order)
select id, '/img/placeholder-product.svg', 0 from public.products;
