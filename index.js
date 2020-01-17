// ItemUtils by SlickNicky10
// Version: 1.1
// Github: https://github.com/SlickNicky10/ItemUtils
(function(){
    const serverVersion = server.getClass().getPackage().getName().split(".")[3].split("_")[1];
    const GUIManager = {
        players: {},
        globalMenus: {},
        displayTemporaryMenu: function(player, view, actions, options){
            const uuid = player.getUniqueId();
            const transfer = this.isViewingGUI(player);
            if(!options) options = {};
            this.players[uuid] = {
                type: "TEMPORARY",
                inGUI: true,
                actions: actions,
                options: {
                    closeAction: options.closeAction ? options.closeAction : null,
                    globalAction: options.globalAction ? options.globalAction : null,
                    extraAction: options.extraAction ? options.extraAction : null,
                    fallbackAction: options.fallbackAction ? options.fallbackAction : null
                },
                transfer: transfer
            };
            player.openInventory(view);
        },
        isViewingGUI: function(player){
            if(this.players[player.getUniqueId()] && this.players[player.getUniqueId()].inGUI) return true;
            return false;
        },
        runGUIAction: function(player, event){
            const uuid = player.getUniqueId();
            const data = GUIManager.players[uuid];
            if(this.globalAction != null){
                try {
                    this.globalAction(event);
                } catch(e){
                    java.lang.System.out.println(`[GUIManager] An error occurred while triggering your global GUI action. This error will likely happen every time a player interacts with your GUIs!`);
                    e.printStackTrace();
                }
            }
            if(data.type == "TEMPORARY"){
                if(data.options.globalAction != null){
                    try {
                        data.options.globalAction(event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a global GUI action for "+player.getName()+".");
                        e.printStackTrace();
                    }
                }
                if(data.actions[event.getRawSlot()]){
                    try {
                        data.actions[event.getRawSlot()](event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for "+player.getName()+".");
                        e.printStackTrace();
                    }
                    if(data.options.extraAction != null){
                        try {
                            data.options.extraAction(event);
                        } catch(e){
                            java.lang.System.out.println("[GUIManager] An error occurred while triggering an extra action for "+player.getName()+".");
                            e.printStackTrace();
                        }
                    }
                } else {
                    if(data.options.fallbackAction != null) data.options.fallbackAction(event);
                }
            } else {
                const id = GUIManager.players[uuid].id;
                if(!GUIManager.globalMenus[id]) return;
                const gui = GUIManager.globalMenus[id];
                if(gui.options.globalAction != null){
                    try {
                        gui.options.globalAction(event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a global GUI action for a global GUI for "+player.getName()+".");
                        e.printStackTrace();
                    }
                }
                if(gui.actions[event.getRawSlot()]){
                    try {
                        gui.actions[event.getRawSlot()](event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for a global GUI for "+player.getName()+".");
                        e.printStackTrace();
                    }
                    if(gui.options.extraAction != null){
                        try {
                            gui.options.extraAction(event);
                        } catch(e){
                            java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for an extra action for a global GUI for "+player.getName()+".");
                            e.printStackTrace();
                        }
                    }
                } else {
                    if(gui.options.fallbackAction) gui.options.fallbackAction(event);
                }
            }
        },
        createGlobalMenu: function(id, view, actions, options){
            if(!id || !view || !actions) return;
            if(!options) options = {};
            this.globalMenus[id] = {
                view: view,
                actions: actions,
                options: {
                    closeAction: options.closeAction ? options.closeAction : null,
                    globalAction: options.globalAction ? options.globalAction : null,
                    extraAction: options.extraAction ? options.extraAction : null,
                    fallbackAction: options.fallbackAction ? options.fallbackAction : null
                }
            }
        },
        deleteGlobalMenu: function(id){
            const players = server.getOnlinePlayers();
            for(var i in players){
                const player = players[i];
                if(this.players[player.getUniqueId()] && this.players[player.getUniqueId()].type == "GLOBAL" && this.players[player.getUniqueId()].id == id && this.isViewingGUI(player)){
                    player.closeInventory();
                }
            }
            delete this.globalMenus[id];
        },
        displayGlobalMenu: function(player, id){
            if(!player || !id) return;
            const transfer = this.isViewingGUI(player);
            this.players[player.getUniqueId()] = {
                type: "GLOBAL",
                id: id,
                inGUI: true,
                transfer: transfer
            };
            player.openInventory(this.globalMenus[id].view);
        },
        globalAction: null,
        setGlobalAction: function(action){
            this.globalAction = action;
        }
    };
    const file = new java.io.File("plugins/Drupi/ItemUtils.yml");
    if(!file.exists()) file.createNewFile();
    const config = org.bukkit.configuration.file.YamlConfiguration.loadConfiguration(file);
    if(config.isSet("templates")){
        GUIManager.templates = config.get("templates");
        GUIManager.createViewFromTemplate = function(id, name, items){
            if(!GUIManager.templates.isSet(id)) return new InventoryBuilder(3, name, {});
            const rows = GUIManager.templates.getList(id);
            const viewItems = {};
            for(var i in rows){
                const list = rows[i].split("");
                if(list.length > 9) list.splice(9, list.length - 9);
                let pos = 0;
                list.forEach(function(TemplateItem){
                    const slot = pos + (9 * i);
                    if(items[TemplateItem]) viewItems[slot] = items[TemplateItem];
                    pos++;
                })
            }
            return new InventoryBuilder(rows.length, name, viewItems);
        }
    } else {
        GUIManager.createViewFromTemplate = function(id, name, items){
            return new InventoryBuilder(3, name, {});
        }
    }
    const itemBuilderCustomOptions = {};
    module.exports = {
        ItemBuilder: (material, name, lore, options) => {
            if(!options) var options = {};
            var material = (typeof material === "string") ? Java.type("org.bukkit.Material").valueOf(material) : material;
            let build = new org.bukkit.inventory.ItemStack(material);
            if(options.amount) build.setAmount(options.amount);
            if(options.durability) build.setDurability(options.durability);
            if(options.enchantments){
                try {
                    options.enchantments.forEach(i => {
                        try {
                            const enchantment = org.bukkit.enchantments.Enchantment[i.id];
                            const level = (i.level != null) ? i.level : 1;
                            build.addUnsafeEnchantment(enchantment, level);
                        } catch(err){
                            err.printStackTrace();
                        };
                    });
                } catch(e){};
            }
            let meta = build.getItemMeta();
            if(name) meta.setDisplayName(name);
            if(lore) meta.setLore(lore);
            if(options.flags) options.flags.forEach(flag => meta.addItemFlags(Java.type("org.bukkit.inventory.ItemFlag").valueOf(flag)));
            if(options.unbreakable) meta.setUnbreakable(options.unbreakable);
            // Terrible way to check if the item is a potion, but it's for support for splash/lingering potions on 1.15 without
            // breaking things for 1.8 users :)
            if(options.potion && material.toString().toLowerCase().indexOf("potion") > -1){
                const useSplashOption = (serverVersion != "13" && serverVersion != "14" && serverVersion != "15") ? true : false;
                if(useSplashOption) build.setDurability((options.potion.splash) ? 16454 : 16);
                meta = cast.as("org.bukkit.inventory.meta.PotionMeta", meta);
                options.potion.effects.forEach(effect => {
                    const type = (typeof effect.type == "string") ? org.bukkit.potion.PotionEffectType[effect.type] : effect.type;
                    if(effect.duration == null) effect.duration = 600;
                    if(effect.amplifier == null) effect.amplifier = 0;
                    if(!effect.ambient) effect.ambient = false;
                    if(effect.particles == null) effect.particles = true;
                    switch(serverVersion){
                        case "13":
                        case "14":
                        case "15":
                            if(effect.icon == null) effect.icon = effect.particles;
                            meta.addCustomEffect(new org.bukkit.potion.PotionEffect(type, effect.duration, effect.amplifier, effect.ambient, effect.particles, effect.icon), true);
                            break;
                        default:
                            meta.addCustomEffect(new org.bukkit.potion.PotionEffect(type, effect.duration, effect.amplifier, effect.ambient, effect.particles), true);
                    }
                });
            }
            build.setItemMeta(meta);
            for(let i in itemBuilderCustomOptions){
                if(options[i]) build = itemBuilderCustomOptions[i](build, options[i]);
            }
            return build;
        },
        InventoryBuilder: (rows, name, items, defaultItem) => {
            const slots = 9*rows;
            const inventory = org.bukkit.Bukkit.createInventory(null, slots, name);
            if(defaultItem){
                for(var i = 0; i < slots; i++){
                    if(!items[i]) inventory.setItem(i, defaultItem);
                }
            }
            for(var i in items){
                if(typeof items[i] === "function"){
                    inventory.setItem(i, items[i]());   
                } else {
                    inventory.setItem(i, items[i]);
                }
            }
            return inventory;
        },
        GUIManager: GUIManager,
        registerItemBuilderCustomOption: (key, callback) => {
            itemBuilderCustomOptions[key] = callback;
            java.lang.System.out.println(`[ItemUtils] Custom ItemBuilder option ${key} has been registered successfully.`);
        }
    };
    event.addListener("InventoryCloseEvent", event => {
        if(GUIManager.players[event.getPlayer().getUniqueId()]){
            var GUI = GUIManager.players[event.getPlayer().getUniqueId()];
            if(GUI.type == "TEMPORARY" && GUI.options && GUI.options.closeAction != null){
                GUI.options.closeAction(event);
            } else if(GUI.type == "GLOBAL" && GUI.id && GUIManager.globalMenus[GUI.id] && GUIManager.globalMenus[GUI.id].options.closeAction != null){
                GUIManager.globalMenus[GUI.id].options.closeAction(event);
            }
        }
        if(GUIManager.players[event.getPlayer().getUniqueId()] && GUIManager.players[event.getPlayer().getUniqueId()].transfer == true){
            GUIManager.players[event.getPlayer().getUniqueId()].transfer = false;
        } else {
            GUIManager.players[event.getPlayer().getUniqueId()] = {};
        }
    });
    event.addListener("InventoryClickEvent", event => {
        if(GUIManager.isViewingGUI(event.getWhoClicked())) GUIManager.runGUIAction(event.getWhoClicked(), event);
    });
    event.addListener("PlayerJoinEvent", event => GUIManager.players[event.getPlayer().getUniqueId()] = {});
    event.addListener("PlayerQuitEvent", event => delete GUIManager.players[event.getPlayer().getUniqueId()]);
}());