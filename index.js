// ItemUtils by SlickNicky10
// Version: 1.0
// Github: https://github.com/SlickNicky10/ItemUtils
(function(){
    const GUIManager = {
        players: {},
        globalMenus: {},
        displayTemporaryMenu: function(player, view, actions, options){
            const uuid = player.getUniqueId();
            const transfer = this.isViewingGUI(player);
            if(!options) options = {};
            this.players[uuid] = {
                guiType: "TEMPORARY",
                inGUI: true,
                guiActions: actions,
                guiOptions: {
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
                    java.lang.System.out.println(`[GUIManager] An error occurred while triggering your global GUI action. This error will likely happen every time a player interacts with your GUIs!\nError:\n${e}`);
                }
            }
            if(data.guiType == "TEMPORARY"){
                if(data.guiOptions.globalAction != null){
                    try {
                        data.guiOptions.globalAction(event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a global GUI action for "+player.getName()+". Error:\n"+e);
                    }
                }
                if(data.guiActions[event.getRawSlot()]){
                    try {
                        data.guiActions[event.getRawSlot()](event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for "+player.getName()+". Error:\n"+e);
                    }
                    if(data.guiOptions.extraAction != null){
                        try {
                            data.guiOptions.extraAction(event);
                        } catch(e){
                            java.lang.System.out.println("[GUIManager] An error occurred while triggering an extra action for "+player.getName()+". Error:\n"+e);
                        }
                    }
                } else {
                    if(data.guiOptions.fallbackAction != null) data.guiOptions.fallbackAction(event);
                }
            } else {
                const id = GUIManager.players[uuid].guiID;
                if(!GUIManager.globalMenus[id]) return;
                const gui = GUIManager.globalMenus[id];
                if(gui.options.globalAction != null){
                    try {
                        gui.options.globalAction(event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a global GUI action for a global GUI for "+player.getName()+". Error:\n"+e);
                    }
                }
                if(gui.actions[event.getRawSlot()]){
                    try {
                        gui.actions[event.getRawSlot()](event);
                    } catch(e){
                        java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for a global GUI for "+player.getName()+". Error:\n"+e);
                    }
                    if(gui.options.extraAction != null){
                        try {
                            gui.options.extraAction(event);
                        } catch(e){
                            java.lang.System.out.println("[GUIManager] An error occurred while triggering a GUI action for an extra action for a global GUI for "+player.getName()+". Error:\n"+e);
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
                options: options
            }
        },
        deleteGlobalMenu: function(id){
            const players = server.getOnlinePlayers();
            for(var i in players){
                const player = players[i];
                if(this.players[player.getUniqueId()] && this.players[player.getUniqueId()].guiType == "GLOBAL" && this.players[player.getUniqueId()].guiID == id && this.isViewingGUI(player)){
                    player.closeInventory();
                }
            }
            delete this.globalMenus[id];
        },
        displayGlobalMenu: function(player, id){
            if(!player || !id) return;
            const transfer = this.isViewingGUI(player);
            this.players[player.getUniqueId()] = {
                guiType: "GLOBAL",
                guiID: id,
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
    module.exports = {
        ItemBuilder: (material, name, lore, options) => {
            if(!options) var options = {};
            var material = (typeof material === "string") ? Java.type("org.bukkit.Material").valueOf(material) : material;
            const build = new org.bukkit.inventory.ItemStack(material);
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
                            logger.info(err);
                        };
                    });
                } catch(e){};
            }
            const meta = build.getItemMeta();
            if(name) meta.setDisplayName(name);
            if(lore) meta.setLore(lore);
            if(options.flags) options.flags.forEach(flag => meta.addItemFlags(Java.type("org.bukkit.inventory.ItemFlag").valueOf(flag)));
            build.setItemMeta(meta);
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
        GUIManager: GUIManager
    };
    event.addListener("InventoryCloseEvent", event => {
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