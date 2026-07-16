# 青萍小红书宣传系列

## 成品

- `output/01-cover.png`：系列封面
- `output/02-today.png`：今日任务
- `output/03-focus.png`：专注计时
- `output/04-review.png`：时间回顾
- `output/05-plan.png`：阶段计划
- `output/06-closing.png`：品牌收束
- `output/00-contact-sheet.jpg`：六张总览

所有单张尺寸均为 `1080 × 1440`，适合小红书 3:4 竖版发布。

## 生成方式

背景使用 Codex 内置 `image_gen` 生成，真实产品截图通过 Pillow 原样合成，避免生成模型改变界面文字、数据和控件。

重新生成版式：

```bash
python promo/xhs-campaign/make_campaign.py
```

排版使用 Windows 系统字体 `Microsoft YaHei`，不包含或分发第三方字体文件。

## 背景生成提示词

```text
Use case: ads-marketing. Asset type: reusable vertical campaign background for a Chinese desktop productivity app named QingPing. Create a refined, airy, premium 3:4 portrait background, 1080x1440 composition. Scene/backdrop: luminous off-white paper with very subtle watercolor fibers, translucent pale jade-green water ripples flowing from upper right to lower left, a few tiny fresh duckweed leaves and dew drops near the edges, restrained hints of misty lilac and cool aqua, generous clean negative space through the center for exact product screenshots and typography to be added later. Style: contemporary Chinese editorial design, quiet luxury, fresh, elegant, sophisticated, not cute. Lighting: soft morning light, natural and clean. Color palette: white, pale jade, celadon, mist lilac, a tiny warm amber accent. Constraints: background only, no device mockup, no user interface, no logo, no words, no letters, no numbers, no watermark, no border, no dark areas, no gradients that look synthetic, no floating orbs, no bokeh.
```
