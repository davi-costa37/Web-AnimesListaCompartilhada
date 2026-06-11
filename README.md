🎌 Anime Tracker - Gerenciador de Maratona e Status
O Anime Tracker é uma aplicação web interativa projetada para catalogar e acompanhar o progresso de visualização de episódios de animes. O sistema calcula a porcentagem de conclusão de cada obra automaticamente, oferece atalhos rápidos para atualizar o progresso de forma incremental e armazena todas as atualizações em tempo real utilizando o Supabase.

⚙️ Funcionalidades Principais
Operações CRUD Completas:

Criação: Adiciona novas obras à coleção validando limites de episódios e notas (restritas de 1 a 10).

Leitura com Filtros Reativos: Carrega os registros ordenados pelo ID mais recente, integrando caixas de busca de texto e abas de filtragem por categoria de status.

Atualização Dinâmica: Permite alterar notas via caixas de diálogo nativas (prompt), editar contagens totais e modificar o status.

Exclusão Segura: Inclui caixas de confirmação antes de apagar permanentemente um registro do banco de dados.

Lógica Inteligente de Status Automatizado:

Incrementar episódios até atingir o limite altera o status do anime automaticamente para "Assistido".

Decrementar episódios até chegar a zero altera o status do anime automaticamente para "Quero assistir".

Valores intermediários rotulam a obra reativamente como "Assistindo".

Painel Geral de Métricas (Dashboard): Um contador dinâmico analisa todo o conjunto de dados para atualizar e exibir os totais gerais e as subdivisões de cada status do acervo.

Paginação por Clique (Load More): Limita a renderização inicial a 6 itens por tela, liberando mais cards de forma otimizada através do botão "Exibir Mais".

🛠️ Tecnologias e Arquitetura
Frontend: JavaScript Avançado (ES6+), HTML5 e CSS3 (Manipulação ativa do DOM baseada em estados).

Banco de Dados (BaaS): Supabase (Integração direta via Client SDK para persistência em nuvem PostgreSQL).

📂 Modelagem de Dados (Tabela do Supabase)
O script realiza consultas baseadas na API nativa da tabela animes, estruturada com os seguintes campos:
animes (tabela)
  ├── id (int8 / primary key / auto-increment)
  ├── nome (text)
  ├── genero (text)
  ├── episodios (int4) - Total de episódios da obra
  ├── episodios_assistidos (int4) - Progresso atual do usuário
  ├── nota (int4 / nullable) - Avaliação de 1 a 10
  └── status (text) - ['Quero assistir', 'Assistindo', 'Assistido']

📄 Licença
Este projeto está sob a licença MIT.
