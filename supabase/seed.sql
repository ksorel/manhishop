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

-- Tailles de démonstration sur la robe exemple + guide des tailles
-- associé : donne un produit avec sélection de taille obligatoire pour
-- tester ce flux en local (tests e2e, recette manuelle). Sur la robe et
-- non le T-shirt exemple, pour ne pas changer le comportement du
-- T-shirt utilisé par un autre test e2e (purchase-flow.spec.ts) qui ne
-- s'attend pas à une sélection de taille obligatoire. Idempotent :
-- réexécutable sans erreur ni doublon.

insert into public.size_guides (slug, title_fr, title_en, display_order, content)
values (
  'demo-vetements',
  'Guide des tailles — Vêtements (démo)',
  'Size guide — Clothing (demo)',
  0,
  '{"headers":[{"fr":"Taille","en":"Size"},{"fr":"Tour de poitrine (cm)","en":"Chest (cm)"}],"rows":[["S","82-85"],["M","86-90"],["L","91-95"]]}'::jsonb
)
on conflict (slug) do nothing;

update public.products
set size_guide_id = (select id from public.size_guides where slug = 'demo-vetements')
where slug = 'exemple-robe-ete';

insert into public.product_sizes (product_id, label, stock, display_order)
select products.id, sizes.label, sizes.stock, sizes.display_order
from public.products
cross join (values ('S', 8, 0), ('M', 12, 1), ('L', 5, 2)) as sizes(label, stock, display_order)
where products.slug = 'exemple-robe-ete'
on conflict (product_id, label) do nothing;
