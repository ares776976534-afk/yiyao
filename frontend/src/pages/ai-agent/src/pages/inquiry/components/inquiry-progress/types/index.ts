
/**
 * 单个问题的进度状态
 */
interface InquiryQuestionProgress {
  /**
   * 问题内容
   */
  q: string;

  /**
   * 是否已获取答案（完成）
   */
  isFinished: boolean;
}

/**
 * 商品信息
 */
interface InquiryMessageItemMeta {
  /**
   * 商品ID
   */
  itemId: string;
  /**
   * 商品链接
   */
  link: string;
  /**
   * 商品图片URL
   */
  img: string;
  /**
   * 商品价格
   */
  price: string;
  /**
   * 商品标题
   */
  title: string;
}

/**
 * 多语言信息
 */
interface InquiryMessageMuliLanInfo {
  /**
   * 翻译后的内容
   */
  lanContent: string;
}

/**
 * 消息元数据
 */
interface InquiryMessageMeta {
  /**
   * 元数据类型（可选，'item' 表示商品消息）
   */
  type?: 'item';
  /**
   * 元数据内容（仅当 type 为 'item' 时存在）
   */
  data?: InquiryMessageItemMeta;
  /**
   * 多语言信息（可选，用于翻译）
   */
  muliLanInfo?: InquiryMessageMuliLanInfo;
}

/**
 * 单条消息
 */
interface InquiryMessage {
  /**
   * 消息发送方角色
   * - 'buyerAssistant': Ai助手（即买家方）
   * - 'seller': 代表卖家
   * - 'buyer': 代表买家
   */
  role: 'buyerAssistant' | 'seller' | 'buyer';

  /**
   * 消息内容
   * 可能是文本、图片 URL 或其他未识别内容（如 "未识别消息类型"）
   */
  content: string;

  /**
   * 消息元数据（可选）
   * 当 type 为 'item' 时，表示这是一条商品消息
   */
  meta?: InquiryMessageMeta;
}

/**
 * 买家与卖家之间的对话会话数据结构
 */
export interface InquiryConversationData {
  /**
   * 问题进度列表，记录每个问题是否已完成
   */
  questionProgress: InquiryQuestionProgress[];

  /**
   * 买家头像 URL
   */
  buyerHeadImg: string;

  /**
   * AI 自动生成的对话摘要
   * 例如："量大有优惠吗答案为没有；最小起批量是多少？还未获取到答案"
   */
  aiSummary: string;

  /**
   * 会话唯一标识符 UUID
   */
  conversationId: string;

  /**
   * 买家公司名称
   */
  companyName: string;

  /**
   * 消息记录列表，按时间顺序排列
   */
  messages: InquiryMessage[];

  /**
   * 当前问题完成进度，以百分比字符串表示（如 "50%"）
   */
  progress: string;

  /**
   * 卖家头像 URL
   */
  sellerHeadImg: string;

  /**
   * 卖家旺旺 ID
   */
  wangwangId: string;
}