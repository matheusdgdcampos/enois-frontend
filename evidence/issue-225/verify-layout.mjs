async (page) => {
  const OUT = process.env.EVIDENCE_DIR ?? "/tmp/issue-225-evidencias";
  const MODE = process.env.EVIDENCE_MODE ?? "after";

  const browser = page.context().browser();

  const fixtures = {
    normal: {
      groupName: "Grupo comum",
      description: "descrição de um tamanho plausível",
      topic: "Sim eu acho",
      user: "Maria da Silva",
      post: "publicas fasoff",
      comment: "comentário comum",
    },
    moderate: {
      groupName: "GrupoComumComNomeExcessivamenteGrandeSemEspacos".repeat(2).slice(0, 120),
      description: "descricaodeumtamanhoplausivelSemEspacos".repeat(16).slice(0, 600),
      topic: "SimEuAchoQueEsseTopicoTemUmNomeMuitoGrandeSemEspacos".repeat(2).slice(0, 40),
      user: "MariaDaSilvaComUmNomeDeUsuarioExcessivamenteGrandeSemEspacos".repeat(2).slice(0, 60),
      post: "publicasfasoffcomumconteudomuitolongo".repeat(10).slice(0, 300),
      comment: "comentariocomumconteudomuitolongo".repeat(10).slice(0, 300),
    },
    extreme: {
      groupName: "GrupoComumComNomeExcessivamenteGrandeSemEspacos".repeat(2).slice(0, 120),
      description: "descricaodeumtamanhoplausivelSemEspacos".repeat(16).slice(0, 600),
      topic: "SimEuAchoQueEsseTopicoTemUmNomeMuitoGrandeSemEspacos".repeat(3).slice(0, 80),
      user: "MariaDaSilvaComUmNomeDeUsuarioExcessivamenteGrandeSemEspacos".repeat(3).slice(0, 120),
      post: "publicasfasoffcomumconteudomuitolongo".repeat(40).slice(0, 1200),
      comment: "comentariocomumconteudomuitolongo".repeat(40).slice(0, 1200),
    },
  };

  const before = [
    {
      id: "374-longos-antes",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "moderate",
      openDialog: true,
      shot: true,
      scrollToPost: true,
    },
    {
      id: "374-extremo-antes",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "extreme",
      openDialog: true,
      shot: false,
    },
  ];

  const after = [
    {
      id: "374-normal-depois",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "normal",
      openDialog: true,
      shot: true,
      scrollToPost: true,
    },
    {
      id: "374-longos-depois",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "moderate",
      openDialog: true,
      shot: true,
      scrollToPost: true,
    },
    {
      id: "374-textos-longos-depois",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "extreme",
      openDialog: false,
      shot: true,
      scrollToTop: true,
    },
    {
      id: "320-longos-depois",
      width: 320,
      height: 700,
      mobile: true,
      fixture: "moderate",
      openDialog: true,
      shot: true,
      scrollToPost: true,
    },
    {
      id: "390-longos-depois",
      width: 390,
      height: 844,
      mobile: true,
      fixture: "moderate",
      openDialog: true,
      shot: false,
    },
    {
      id: "1280-desktop-depois",
      width: 1280,
      height: 800,
      mobile: false,
      fixture: "normal",
      openDialog: false,
      shot: true,
      scrollToTop: true,
      collapseChat: true,
    },
    {
      id: "374-longos-comentarios-depois",
      width: 374,
      height: 846,
      mobile: true,
      fixture: "extreme",
      openDialog: false,
      openComments: true,
      shot: true,
      scrollToPost: true,
    },
  ];

  async function run(scenario) {
    const f = fixtures[scenario.fixture];
    const ctx = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      isMobile: scenario.mobile,
      hasTouch: scenario.mobile,
      deviceScaleFactor: 1,
      colorScheme: scenario.theme === "light" ? "light" : "dark",
    });
    const p = await ctx.newPage();

    const me = {
      id: "me-1",
      username: "maria",
      name: f.user,
      headline: null,
      email: "fixture@example.com",
      company: null,
      location: null,
      avatar: null,
      banner: null,
      badge: null,
      bio: null,
      skills: [],
      goals: [],
      availability: null,
      portfolio: null,
      externalLinks: [],
      openToWork: false,
      isMentor: false,
    };
    const group = {
      id: "g1",
      slug: "grupo-comum",
      name: f.groupName,
      description: f.description,
      topic: null,
      avatar: null,
      banner: null,
      bannerHtml: null,
      joinMode: "APPROVAL",
      status: "ACTIVE",
      members: 1,
      viewerRole: "OWNER",
      joined: true,
      requestPending: false,
      createdAt: new Date().toISOString(),
    };
    const topic = {
      id: "t1",
      groupId: "g1",
      name: f.topic,
      description: null,
      position: 0,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    const post = {
      id: "p1",
      groupId: "g1",
      topicId: "t1",
      authorId: "me-1",
      authorName: f.user,
      authorUsername: "maria",
      authorAvatar: null,
      authorAvatarFrame: null,
      authorStyle: null,
      authorBadges: [],
      content: f.post,
      mediaIds: [],
      pinned: true,
      reactions: 0,
      comments: 1,
      myReaction: null,
      createdAt: new Date().toISOString(),
    };
    const comment = {
      id: "c1",
      postId: "p1",
      authorId: "me-1",
      authorName: f.user,
      authorUsername: "maria",
      authorAvatar: null,
      authorAvatarFrame: null,
      authorStyle: null,
      authorBadges: [],
      content: f.comment,
      createdAt: new Date().toISOString(),
    };

    await p.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (!url.pathname.startsWith("/api/")) return route.continue();
      const json = (obj) =>
        route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(obj) });
      const path = url.pathname;
      if (path === "/api/me") return json(me);
      if (/^\/api\/groups\/[^/]+$/.test(path)) return json(group);
      if (path.endsWith("/topics")) return json({ items: [topic], nextCursor: null });
      if (path.endsWith("/pinned")) return json(null);
      if (path.endsWith("/comments")) return json({ items: [comment], nextCursor: null });
      if (path.endsWith("/posts")) return json({ items: [post], nextCursor: null });
      return json({ items: [], nextCursor: null, total: 0 });
    });

    const theme = scenario.theme ?? "dark";
    await p.addInitScript(
      ({ theme }) => {
        localStorage.setItem("session_active", "1");
        localStorage.setItem("session_id", "fixture");
        localStorage.setItem(
          "current_user",
          JSON.stringify({ id: "me-1", username: "maria", name: "Maria" }),
        );
        localStorage.setItem(
          "connect-grow-preferences",
          JSON.stringify({ state: { theme } }),
        );
      },
      { theme },
    );

    await p.goto("http://localhost:8080/grupos/grupo-comum", { waitUntil: "networkidle" });
    await p.getByText(f.post, { exact: false }).first().waitFor({ timeout: 20000 });

    if (scenario.scrollToPost) {
      await p.getByText(f.post, { exact: false }).first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(250);
    }
    if (scenario.scrollToTop) {
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.waitForTimeout(250);
    }
    if (scenario.collapseChat) {
      const collapse = p.getByRole("button", { name: "Minimizar mensagens" });
      if (await collapse.count()) {
        await collapse.first().click();
        await p.waitForTimeout(300);
      }
    }

    const base = await p.evaluate(() => ({
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    let dialog = null;
    if (scenario.openDialog) {
      await p.getByRole("button", { name: "Remover", exact: true }).evaluate((el) => el.click());
      await p.getByText("Remover publicação?").waitFor({ timeout: 5000 });
      await p.waitForTimeout(600);
      dialog = await p.evaluate(() => {
        const title = Array.from(document.querySelectorAll("*")).find(
          (el) => el.textContent === "Remover publicação?",
        );
        const el = title?.closest('[role="dialog"]');
        const r = el?.getBoundingClientRect();
        return r
          ? {
              x: Math.round(r.x),
              right: Math.round(r.right),
              width: Math.round(r.width),
              centered:
                Math.abs(r.left - (document.documentElement.clientWidth - r.width) / 2) <= 1,
              visible: r.right > 0 && r.left < document.documentElement.clientWidth,
            }
          : null;
      });
    }

    if (scenario.shot) {
      await p.screenshot({ path: `${OUT}/${scenario.id}.png` });
    }

    let comments = null;
    if (scenario.openComments) {
      await p.keyboard.press("Escape");
      await p.waitForTimeout(300);
      await p
        .getByRole("button", { name: /Comentários \(\d+\)/ })
        .evaluate((el) => el.click());
      await p.getByText(f.comment, { exact: false }).first().waitFor({ timeout: 5000 });
      await p.getByText(f.comment, { exact: false }).first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(400);
      comments = await p.evaluate(() => ({
        innerWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      await p.screenshot({ path: `${OUT}/${scenario.id}.png` });
    }

    await ctx.close();
    return { id: scenario.id, width: scenario.width, theme, base, dialog, comments };
  }

  const results = [];
  for (const scenario of MODE === "before" ? before : after) {
    results.push(await run(scenario));
  }
  return results;
}
