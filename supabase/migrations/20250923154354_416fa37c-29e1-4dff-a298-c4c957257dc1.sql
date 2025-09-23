-- Update all existing initiatives to be located in Genova districts and be relevant for new Italian arrivals
UPDATE public.initiatives SET 
  location = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 'Parco del Peralto, Quarto'
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 'Teatro Carlo Felice, Centro Storico'
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 'Centro Sportivo Albaro'
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 'Piazza De Ferrari, Centro Storico'
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 'Mercato Orientale, Centro Storico'
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 'Basilica di Santa Maria Assunta, Carignano'
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 'Spianata Castelletto'
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 'Centro Civico Buranello, Sampierdarena'
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 'Partenza da Via del Campo, Centro Storico'
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 'Cinema Ariston, Centro Storico'
    ELSE location
  END,
  title = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 'Pulizia Volontaria Parco del Peralto'
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 'Festival Musicale Genovese al Carlo Felice'
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 'Torneo Calcetto Solidale Albaro'
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 'Mercatino Libri Usati Piazza De Ferrari'
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 'Corso Cucina Ligure al Mercato Orientale'
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 'Concerto Natalizio a Carignano'
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 'Yoga alla Spianata Castelletto'
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 'Laboratorio Ceramica Bambini Sampierdarena'
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 'Maratona di Genova 2025'
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 'Festival Cinema Indipendente Genovese'
    ELSE title
  END,
  description = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 'Giornata di volontariato per la pulizia del parco nel quartiere di Quarto. Ottimo modo per conoscere la comunità locale!'
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 'Festival di musica classica nel prestigioso Teatro Carlo Felice. Perfetto per immergersi nella cultura genovese.'
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 'Torneo di calcetto solidale ad Albaro. Ottima occasione per fare sport e socializzare con i genovesi.'
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 'Mercatino del libro nella storica Piazza De Ferrari, cuore di Genova. Ideale per praticare litaliano.'
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 'Corso di cucina ligure tradizionale al Mercato Orientale. Impara a cucinare il pesto e la focaccia genovese!'
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 'Concerto natalizio nella splendida Basilica di Carignano, quartiere elegante di Genova.'
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 'Sessioni di yoga con vista mozzafiato sulla città dalla Spianata Castelletto.'
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 'Laboratorio di ceramica per bambini a Sampierdarena, quartiere multiculturale di Genova.'
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 'La maratona di Genova attraversa i caruggi del centro storico, patrimonio UNESCO.'
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 'Rassegna di cinema indipendente al Cinema Ariston nel centro storico di Genova.'
    ELSE description
  END,
  nai_benefits = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 'Permette di conoscere vicini di casa e volontari locali, migliorando lintegrazione nel quartiere di Quarto.'
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 'Offre lopportunità di immergersi nella ricca tradizione culturale genovese e italiana.'
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 'Facilita lincontro con giovani genovesi attraverso lo sport, creando amicizie durature.'
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 'Aiuta a migliorare la conoscenza dellitaliano attraverso la lettura e le conversazioni informali.'
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 'Insegna la cucina tradizionale ligure, facilitando lintegrazione culturale e alimentare.'
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 'Introduce alle tradizioni natalizie italiane e permette di conoscere la comunità religiosa locale.'
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 'Favorisce il benessere psicofisico e crea legami con altri partecipanti in un ambiente rilassante.'
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 'Offre attività per bambini nel quartiere multiculturale di Sampierdarena, favorendo lintegrazione familiare.'
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 'Permette di scoprire Genova correndo attraverso la sua storia, dai caruggi al porto antico.'
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 'Stimola la comprensione della cultura cinematografica italiana e europea contemporanea.'
    ELSE nai_benefits
  END,
  latitude = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 44.4264
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 44.4070
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 44.3922
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 44.4056
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 44.4088
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 44.4042
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 44.4154
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 44.4286
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 44.4074
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 44.4067
    ELSE latitude
  END,
  longitude = CASE 
    WHEN id = '79c2137c-cd0f-4ada-910b-5f4811e5a82a' THEN 8.9434
    WHEN id = '36c2684f-4e38-45e7-b4f9-fea41589d19b' THEN 8.9336
    WHEN id = '6f656387-49c0-473d-a7e5-aadf4cd5c8e9' THEN 8.9736
    WHEN id = 'd794d261-8b24-4308-8fa6-65b667cfad3d' THEN 8.9343
    WHEN id = '60eb2bbd-0b84-45d6-ab4e-d68258aaf433' THEN 8.9354
    WHEN id = 'dcaea3e9-399e-4c6d-9815-dd520f2db20f' THEN 8.9298
    WHEN id = '5e49c07e-10b2-4960-995f-13dee459a2e2' THEN 8.9344
    WHEN id = 'fd3745f1-542f-4741-b417-dd0dcc6f6c86' THEN 8.9089
    WHEN id = 'a6caf84b-e9e9-4479-b50d-1d2b1199106f' THEN 8.9315
    WHEN id = '61c5fd7d-928d-4002-9ae5-70a7f8b3a883' THEN 8.9328
    ELSE longitude
  END;