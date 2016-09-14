import PIXI from 'pixi';


export const Position = {
    name: 'Position',
    state: {
        x: 0,
        y: 0,
    }
};

export const Sprite = {
    name: 'Sprite',
    state: {
        sprite: '',

        deleted: false,
        visible: true,
    }
};

export const Text = {
    name: 'Text',
    state: {
        text: '',
        color: 'white',
        font: 'Arial',
        size: '30px',
    }
};


/**
 * A processor that takes care of all things related to displaying the game.
 * It needs to be instanciated first, because it creates the stage where
 * everything is rendered, and updated last, because you'll want to show all
 * changes that happened during the current frame.
 *
 * Manipulates components `Position`, `Sprite` and `Text`.
 */
export default class PIXIRenderingProcessor {
    constructor(manager, containerElt, stageWidth, stageHeight, PIXIOptions) {
        this.manager = manager;

        this.renderer = PIXI.autoDetectRenderer(stageWidth, stageHeight, PIXIOptions);
        containerElt.appendChild(this.renderer.view);

        this.stage = new PIXI.Container();

        // An associative array for entities' sprites.
        // entity id -> sprite
        this.sprites = {};
    },

    createSprite(entity, data) {
        let positionData = this.manager.getComponentDataForEntity('Position', entity);

        let texture = PIXI.Texture.fromImage(data.sprite);
        let sprite = new PIXI.Sprite(texture);

        sprite.position.x = positionData.x;
        sprite.position.y = positionData.y;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        this.stage.addChild(sprite);

        this.sprites[entity] = sprite;
    },

    createText(entity, data) {
        let positionData = this.manager.getComponentDataForEntity('Position', entity);

        let text = new PIXI.Text(
            data.text,
            {
                font: data.size + ' ' + data.font,
                fill: data.color,
                align: 'center',
            }
        );

        text.position.x = positionData.x;
        text.position.y = positionData.y;
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;

        this.stage.addChild(text);

        this.sprites[entity] = text;
    },

    update(dt) {
        let entity;

        // Update state of all Sprites.
        let displayables = this.manager.getComponentsData('Sprite');

        for (entity in displayables) {
            // if 'deleted', do not display (no sprite)
            if (displayables[entity].deleted) {
                continue;
            }

            // Create the actual PIXI.Sprite object if it doesn't exist yet.
            if (!this.sprites[entity]) {
                this.createSprite(entity, displayables[entity]);
            }

            let sprite = this.sprites[entity];
            sprite.visible = displayables[entity].visible;

            // Update the position of each sprite.
            let positionData = this.manager.getComponentDataForEntity('Position', entity);
            sprite.x = positionData.x;
            sprite.y = positionData.y;
        }

        // Update state of all Texts.
        let texts = this.manager.getComponentsData('Text');

        for (entity in texts) {
            let t = texts[entity];

            // First create the actual PIXI.Text object if it doesn't exist yet.
            if (!this.sprites[entity]) {
                this.createText(entity, t);
            }

            let text = this.sprites[entity];

            text.text = t.text;
            text.style.font = t.size + ' ' + t.font;
            text.style.fill = t.color;

            // Then update the position of each sprite.
            let positionData = this.manager.getComponentDataForEntity('Position', entity);
            text.x = positionData.x;
            text.y = positionData.y;
        }

        // Render everything.
        this.renderer.render(this.stage);
    }
};
