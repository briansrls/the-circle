/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * AIType enum.
 * @exports AIType
 * @enum {number}
 * @property {number} OPENAI=0 OPENAI value
 * @property {number} GEMINI=1 GEMINI value
 * @property {number} CLAUDE=2 CLAUDE value
 */
export const AIType = $root.AIType = (() => {
    const valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "OPENAI"] = 0;
    values[valuesById[1] = "GEMINI"] = 1;
    values[valuesById[2] = "CLAUDE"] = 2;
    return values;
})();

export const AgentConfig = $root.AgentConfig = (() => {

    /**
     * Properties of an AgentConfig.
     * @exports IAgentConfig
     * @interface IAgentConfig
     * @property {string|null} [name] AgentConfig name
     * @property {string|null} [systemPrompt] AgentConfig systemPrompt
     * @property {string|null} [seedFile] AgentConfig seedFile
     * @property {string|null} [model] AgentConfig model
     * @property {AIType|null} [aiType] AgentConfig aiType
     */

    /**
     * Constructs a new AgentConfig.
     * @exports AgentConfig
     * @classdesc Represents an AgentConfig.
     * @implements IAgentConfig
     * @constructor
     * @param {IAgentConfig=} [properties] Properties to set
     */
    function AgentConfig(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AgentConfig name.
     * @member {string} name
     * @memberof AgentConfig
     * @instance
     */
    AgentConfig.prototype.name = "";

    /**
     * AgentConfig systemPrompt.
     * @member {string} systemPrompt
     * @memberof AgentConfig
     * @instance
     */
    AgentConfig.prototype.systemPrompt = "";

    /**
     * AgentConfig seedFile.
     * @member {string} seedFile
     * @memberof AgentConfig
     * @instance
     */
    AgentConfig.prototype.seedFile = "";

    /**
     * AgentConfig model.
     * @member {string} model
     * @memberof AgentConfig
     * @instance
     */
    AgentConfig.prototype.model = "";

    /**
     * AgentConfig aiType.
     * @member {AIType} aiType
     * @memberof AgentConfig
     * @instance
     */
    AgentConfig.prototype.aiType = 0;

    /**
     * Creates a new AgentConfig instance using the specified properties.
     * @function create
     * @memberof AgentConfig
     * @static
     * @param {IAgentConfig=} [properties] Properties to set
     * @returns {AgentConfig} AgentConfig instance
     */
    AgentConfig.create = function create(properties) {
        return new AgentConfig(properties);
    };

    /**
     * Encodes the specified AgentConfig message. Does not implicitly {@link AgentConfig.verify|verify} messages.
     * @function encode
     * @memberof AgentConfig
     * @static
     * @param {IAgentConfig} message AgentConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AgentConfig.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
        if (message.systemPrompt != null && Object.hasOwnProperty.call(message, "systemPrompt"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.systemPrompt);
        if (message.seedFile != null && Object.hasOwnProperty.call(message, "seedFile"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.seedFile);
        if (message.model != null && Object.hasOwnProperty.call(message, "model"))
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.model);
        if (message.aiType != null && Object.hasOwnProperty.call(message, "aiType"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.aiType);
        return writer;
    };

    /**
     * Encodes the specified AgentConfig message, length delimited. Does not implicitly {@link AgentConfig.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AgentConfig
     * @static
     * @param {IAgentConfig} message AgentConfig message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AgentConfig.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AgentConfig message from the specified reader or buffer.
     * @function decode
     * @memberof AgentConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AgentConfig} AgentConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AgentConfig.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.AgentConfig();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.name = reader.string();
                    break;
                }
            case 2: {
                    message.systemPrompt = reader.string();
                    break;
                }
            case 3: {
                    message.seedFile = reader.string();
                    break;
                }
            case 4: {
                    message.model = reader.string();
                    break;
                }
            case 5: {
                    message.aiType = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AgentConfig message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AgentConfig
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AgentConfig} AgentConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AgentConfig.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AgentConfig message.
     * @function verify
     * @memberof AgentConfig
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AgentConfig.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.systemPrompt != null && message.hasOwnProperty("systemPrompt"))
            if (!$util.isString(message.systemPrompt))
                return "systemPrompt: string expected";
        if (message.seedFile != null && message.hasOwnProperty("seedFile"))
            if (!$util.isString(message.seedFile))
                return "seedFile: string expected";
        if (message.model != null && message.hasOwnProperty("model"))
            if (!$util.isString(message.model))
                return "model: string expected";
        if (message.aiType != null && message.hasOwnProperty("aiType"))
            switch (message.aiType) {
            default:
                return "aiType: enum value expected";
            case 0:
            case 1:
            case 2:
                break;
            }
        return null;
    };

    /**
     * Creates an AgentConfig message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AgentConfig
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AgentConfig} AgentConfig
     */
    AgentConfig.fromObject = function fromObject(object) {
        if (object instanceof $root.AgentConfig)
            return object;
        let message = new $root.AgentConfig();
        if (object.name != null)
            message.name = String(object.name);
        if (object.systemPrompt != null)
            message.systemPrompt = String(object.systemPrompt);
        if (object.seedFile != null)
            message.seedFile = String(object.seedFile);
        if (object.model != null)
            message.model = String(object.model);
        switch (object.aiType) {
        default:
            if (typeof object.aiType === "number") {
                message.aiType = object.aiType;
                break;
            }
            break;
        case "OPENAI":
        case 0:
            message.aiType = 0;
            break;
        case "GEMINI":
        case 1:
            message.aiType = 1;
            break;
        case "CLAUDE":
        case 2:
            message.aiType = 2;
            break;
        }
        return message;
    };

    /**
     * Creates a plain object from an AgentConfig message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AgentConfig
     * @static
     * @param {AgentConfig} message AgentConfig
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AgentConfig.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.name = "";
            object.systemPrompt = "";
            object.seedFile = "";
            object.model = "";
            object.aiType = options.enums === String ? "OPENAI" : 0;
        }
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.systemPrompt != null && message.hasOwnProperty("systemPrompt"))
            object.systemPrompt = message.systemPrompt;
        if (message.seedFile != null && message.hasOwnProperty("seedFile"))
            object.seedFile = message.seedFile;
        if (message.model != null && message.hasOwnProperty("model"))
            object.model = message.model;
        if (message.aiType != null && message.hasOwnProperty("aiType"))
            object.aiType = options.enums === String ? $root.AIType[message.aiType] === undefined ? message.aiType : $root.AIType[message.aiType] : message.aiType;
        return object;
    };

    /**
     * Converts this AgentConfig to JSON.
     * @function toJSON
     * @memberof AgentConfig
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AgentConfig.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AgentConfig
     * @function getTypeUrl
     * @memberof AgentConfig
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AgentConfig.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AgentConfig";
    };

    return AgentConfig;
})();

export const Relationship = $root.Relationship = (() => {

    /**
     * Properties of a Relationship.
     * @exports IRelationship
     * @interface IRelationship
     * @property {string|null} [relationType] Relationship relationType
     * @property {Array.<string>|null} [agents] Relationship agents
     */

    /**
     * Constructs a new Relationship.
     * @exports Relationship
     * @classdesc Represents a Relationship.
     * @implements IRelationship
     * @constructor
     * @param {IRelationship=} [properties] Properties to set
     */
    function Relationship(properties) {
        this.agents = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Relationship relationType.
     * @member {string} relationType
     * @memberof Relationship
     * @instance
     */
    Relationship.prototype.relationType = "";

    /**
     * Relationship agents.
     * @member {Array.<string>} agents
     * @memberof Relationship
     * @instance
     */
    Relationship.prototype.agents = $util.emptyArray;

    /**
     * Creates a new Relationship instance using the specified properties.
     * @function create
     * @memberof Relationship
     * @static
     * @param {IRelationship=} [properties] Properties to set
     * @returns {Relationship} Relationship instance
     */
    Relationship.create = function create(properties) {
        return new Relationship(properties);
    };

    /**
     * Encodes the specified Relationship message. Does not implicitly {@link Relationship.verify|verify} messages.
     * @function encode
     * @memberof Relationship
     * @static
     * @param {IRelationship} message Relationship message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Relationship.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.relationType != null && Object.hasOwnProperty.call(message, "relationType"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.relationType);
        if (message.agents != null && message.agents.length)
            for (let i = 0; i < message.agents.length; ++i)
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.agents[i]);
        return writer;
    };

    /**
     * Encodes the specified Relationship message, length delimited. Does not implicitly {@link Relationship.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Relationship
     * @static
     * @param {IRelationship} message Relationship message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Relationship.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Relationship message from the specified reader or buffer.
     * @function decode
     * @memberof Relationship
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Relationship} Relationship
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Relationship.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.Relationship();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.relationType = reader.string();
                    break;
                }
            case 2: {
                    if (!(message.agents && message.agents.length))
                        message.agents = [];
                    message.agents.push(reader.string());
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Relationship message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Relationship
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Relationship} Relationship
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Relationship.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Relationship message.
     * @function verify
     * @memberof Relationship
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Relationship.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.relationType != null && message.hasOwnProperty("relationType"))
            if (!$util.isString(message.relationType))
                return "relationType: string expected";
        if (message.agents != null && message.hasOwnProperty("agents")) {
            if (!Array.isArray(message.agents))
                return "agents: array expected";
            for (let i = 0; i < message.agents.length; ++i)
                if (!$util.isString(message.agents[i]))
                    return "agents: string[] expected";
        }
        return null;
    };

    /**
     * Creates a Relationship message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Relationship
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Relationship} Relationship
     */
    Relationship.fromObject = function fromObject(object) {
        if (object instanceof $root.Relationship)
            return object;
        let message = new $root.Relationship();
        if (object.relationType != null)
            message.relationType = String(object.relationType);
        if (object.agents) {
            if (!Array.isArray(object.agents))
                throw TypeError(".Relationship.agents: array expected");
            message.agents = [];
            for (let i = 0; i < object.agents.length; ++i)
                message.agents[i] = String(object.agents[i]);
        }
        return message;
    };

    /**
     * Creates a plain object from a Relationship message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Relationship
     * @static
     * @param {Relationship} message Relationship
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Relationship.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.agents = [];
        if (options.defaults)
            object.relationType = "";
        if (message.relationType != null && message.hasOwnProperty("relationType"))
            object.relationType = message.relationType;
        if (message.agents && message.agents.length) {
            object.agents = [];
            for (let j = 0; j < message.agents.length; ++j)
                object.agents[j] = message.agents[j];
        }
        return object;
    };

    /**
     * Converts this Relationship to JSON.
     * @function toJSON
     * @memberof Relationship
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Relationship.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Relationship
     * @function getTypeUrl
     * @memberof Relationship
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Relationship.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Relationship";
    };

    return Relationship;
})();

export const AgentsDefinition = $root.AgentsDefinition = (() => {

    /**
     * Properties of an AgentsDefinition.
     * @exports IAgentsDefinition
     * @interface IAgentsDefinition
     * @property {Array.<IAgentConfig>|null} [agents] AgentsDefinition agents
     * @property {Array.<IRelationship>|null} [relationships] AgentsDefinition relationships
     */

    /**
     * Constructs a new AgentsDefinition.
     * @exports AgentsDefinition
     * @classdesc Represents an AgentsDefinition.
     * @implements IAgentsDefinition
     * @constructor
     * @param {IAgentsDefinition=} [properties] Properties to set
     */
    function AgentsDefinition(properties) {
        this.agents = [];
        this.relationships = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * AgentsDefinition agents.
     * @member {Array.<IAgentConfig>} agents
     * @memberof AgentsDefinition
     * @instance
     */
    AgentsDefinition.prototype.agents = $util.emptyArray;

    /**
     * AgentsDefinition relationships.
     * @member {Array.<IRelationship>} relationships
     * @memberof AgentsDefinition
     * @instance
     */
    AgentsDefinition.prototype.relationships = $util.emptyArray;

    /**
     * Creates a new AgentsDefinition instance using the specified properties.
     * @function create
     * @memberof AgentsDefinition
     * @static
     * @param {IAgentsDefinition=} [properties] Properties to set
     * @returns {AgentsDefinition} AgentsDefinition instance
     */
    AgentsDefinition.create = function create(properties) {
        return new AgentsDefinition(properties);
    };

    /**
     * Encodes the specified AgentsDefinition message. Does not implicitly {@link AgentsDefinition.verify|verify} messages.
     * @function encode
     * @memberof AgentsDefinition
     * @static
     * @param {IAgentsDefinition} message AgentsDefinition message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AgentsDefinition.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.agents != null && message.agents.length)
            for (let i = 0; i < message.agents.length; ++i)
                $root.AgentConfig.encode(message.agents[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.relationships != null && message.relationships.length)
            for (let i = 0; i < message.relationships.length; ++i)
                $root.Relationship.encode(message.relationships[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified AgentsDefinition message, length delimited. Does not implicitly {@link AgentsDefinition.verify|verify} messages.
     * @function encodeDelimited
     * @memberof AgentsDefinition
     * @static
     * @param {IAgentsDefinition} message AgentsDefinition message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    AgentsDefinition.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes an AgentsDefinition message from the specified reader or buffer.
     * @function decode
     * @memberof AgentsDefinition
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {AgentsDefinition} AgentsDefinition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AgentsDefinition.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.AgentsDefinition();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (!(message.agents && message.agents.length))
                        message.agents = [];
                    message.agents.push($root.AgentConfig.decode(reader, reader.uint32()));
                    break;
                }
            case 2: {
                    if (!(message.relationships && message.relationships.length))
                        message.relationships = [];
                    message.relationships.push($root.Relationship.decode(reader, reader.uint32()));
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes an AgentsDefinition message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof AgentsDefinition
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {AgentsDefinition} AgentsDefinition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    AgentsDefinition.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies an AgentsDefinition message.
     * @function verify
     * @memberof AgentsDefinition
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    AgentsDefinition.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.agents != null && message.hasOwnProperty("agents")) {
            if (!Array.isArray(message.agents))
                return "agents: array expected";
            for (let i = 0; i < message.agents.length; ++i) {
                let error = $root.AgentConfig.verify(message.agents[i]);
                if (error)
                    return "agents." + error;
            }
        }
        if (message.relationships != null && message.hasOwnProperty("relationships")) {
            if (!Array.isArray(message.relationships))
                return "relationships: array expected";
            for (let i = 0; i < message.relationships.length; ++i) {
                let error = $root.Relationship.verify(message.relationships[i]);
                if (error)
                    return "relationships." + error;
            }
        }
        return null;
    };

    /**
     * Creates an AgentsDefinition message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof AgentsDefinition
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {AgentsDefinition} AgentsDefinition
     */
    AgentsDefinition.fromObject = function fromObject(object) {
        if (object instanceof $root.AgentsDefinition)
            return object;
        let message = new $root.AgentsDefinition();
        if (object.agents) {
            if (!Array.isArray(object.agents))
                throw TypeError(".AgentsDefinition.agents: array expected");
            message.agents = [];
            for (let i = 0; i < object.agents.length; ++i) {
                if (typeof object.agents[i] !== "object")
                    throw TypeError(".AgentsDefinition.agents: object expected");
                message.agents[i] = $root.AgentConfig.fromObject(object.agents[i]);
            }
        }
        if (object.relationships) {
            if (!Array.isArray(object.relationships))
                throw TypeError(".AgentsDefinition.relationships: array expected");
            message.relationships = [];
            for (let i = 0; i < object.relationships.length; ++i) {
                if (typeof object.relationships[i] !== "object")
                    throw TypeError(".AgentsDefinition.relationships: object expected");
                message.relationships[i] = $root.Relationship.fromObject(object.relationships[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from an AgentsDefinition message. Also converts values to other types if specified.
     * @function toObject
     * @memberof AgentsDefinition
     * @static
     * @param {AgentsDefinition} message AgentsDefinition
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    AgentsDefinition.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults) {
            object.agents = [];
            object.relationships = [];
        }
        if (message.agents && message.agents.length) {
            object.agents = [];
            for (let j = 0; j < message.agents.length; ++j)
                object.agents[j] = $root.AgentConfig.toObject(message.agents[j], options);
        }
        if (message.relationships && message.relationships.length) {
            object.relationships = [];
            for (let j = 0; j < message.relationships.length; ++j)
                object.relationships[j] = $root.Relationship.toObject(message.relationships[j], options);
        }
        return object;
    };

    /**
     * Converts this AgentsDefinition to JSON.
     * @function toJSON
     * @memberof AgentsDefinition
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    AgentsDefinition.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for AgentsDefinition
     * @function getTypeUrl
     * @memberof AgentsDefinition
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    AgentsDefinition.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/AgentsDefinition";
    };

    return AgentsDefinition;
})();

export { $root as default };
