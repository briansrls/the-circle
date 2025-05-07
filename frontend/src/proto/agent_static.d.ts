import * as $protobuf from "protobufjs";
import Long = require("long");
/** AIType enum. */
export enum AIType {
    OPENAI = 0,
    GEMINI = 1,
    CLAUDE = 2
}

/** Represents an AgentConfig. */
export class AgentConfig implements IAgentConfig {

    /**
     * Constructs a new AgentConfig.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAgentConfig);

    /** AgentConfig name. */
    public name: string;

    /** AgentConfig systemPrompt. */
    public systemPrompt: string;

    /** AgentConfig seedFile. */
    public seedFile: string;

    /** AgentConfig model. */
    public model: string;

    /** AgentConfig aiType. */
    public aiType: AIType;

    /**
     * Creates a new AgentConfig instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AgentConfig instance
     */
    public static create(properties?: IAgentConfig): AgentConfig;

    /**
     * Encodes the specified AgentConfig message. Does not implicitly {@link AgentConfig.verify|verify} messages.
     * @param message AgentConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAgentConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AgentConfig message, length delimited. Does not implicitly {@link AgentConfig.verify|verify} messages.
     * @param message AgentConfig message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAgentConfig, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AgentConfig message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AgentConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AgentConfig;

    /**
     * Decodes an AgentConfig message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AgentConfig
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AgentConfig;

    /**
     * Verifies an AgentConfig message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AgentConfig message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AgentConfig
     */
    public static fromObject(object: { [k: string]: any }): AgentConfig;

    /**
     * Creates a plain object from an AgentConfig message. Also converts values to other types if specified.
     * @param message AgentConfig
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AgentConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AgentConfig to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AgentConfig
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents a Relationship. */
export class Relationship implements IRelationship {

    /**
     * Constructs a new Relationship.
     * @param [properties] Properties to set
     */
    constructor(properties?: IRelationship);

    /** Relationship relationType. */
    public relationType: string;

    /** Relationship agents. */
    public agents: string[];

    /**
     * Creates a new Relationship instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Relationship instance
     */
    public static create(properties?: IRelationship): Relationship;

    /**
     * Encodes the specified Relationship message. Does not implicitly {@link Relationship.verify|verify} messages.
     * @param message Relationship message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IRelationship, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Relationship message, length delimited. Does not implicitly {@link Relationship.verify|verify} messages.
     * @param message Relationship message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IRelationship, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Relationship message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Relationship
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Relationship;

    /**
     * Decodes a Relationship message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Relationship
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Relationship;

    /**
     * Verifies a Relationship message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Relationship message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Relationship
     */
    public static fromObject(object: { [k: string]: any }): Relationship;

    /**
     * Creates a plain object from a Relationship message. Also converts values to other types if specified.
     * @param message Relationship
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Relationship, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Relationship to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Relationship
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Represents an AgentsDefinition. */
export class AgentsDefinition implements IAgentsDefinition {

    /**
     * Constructs a new AgentsDefinition.
     * @param [properties] Properties to set
     */
    constructor(properties?: IAgentsDefinition);

    /** AgentsDefinition agents. */
    public agents: IAgentConfig[];

    /** AgentsDefinition relationships. */
    public relationships: IRelationship[];

    /**
     * Creates a new AgentsDefinition instance using the specified properties.
     * @param [properties] Properties to set
     * @returns AgentsDefinition instance
     */
    public static create(properties?: IAgentsDefinition): AgentsDefinition;

    /**
     * Encodes the specified AgentsDefinition message. Does not implicitly {@link AgentsDefinition.verify|verify} messages.
     * @param message AgentsDefinition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IAgentsDefinition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified AgentsDefinition message, length delimited. Does not implicitly {@link AgentsDefinition.verify|verify} messages.
     * @param message AgentsDefinition message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IAgentsDefinition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an AgentsDefinition message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns AgentsDefinition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): AgentsDefinition;

    /**
     * Decodes an AgentsDefinition message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns AgentsDefinition
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): AgentsDefinition;

    /**
     * Verifies an AgentsDefinition message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an AgentsDefinition message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns AgentsDefinition
     */
    public static fromObject(object: { [k: string]: any }): AgentsDefinition;

    /**
     * Creates a plain object from an AgentsDefinition message. Also converts values to other types if specified.
     * @param message AgentsDefinition
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: AgentsDefinition, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this AgentsDefinition to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for AgentsDefinition
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
