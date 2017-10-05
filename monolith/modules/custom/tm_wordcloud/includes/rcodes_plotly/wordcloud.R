args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(NLP))
suppressPackageStartupMessages(library(tm))
suppressPackageStartupMessages(library(SnowballC))
suppressPackageStartupMessages(library(RColorBrewer))
suppressPackageStartupMessages(library(wordcloud))
suppressPackageStartupMessages(library(RJSONIO))


GetDataFrame <- function(csvPath, filesType = "csv") {
  
  df <- fread(input = csvPath,
              header = T,
              sep = ',',
              na.strings = c("", "NA"),
              stringsAsFactors = TRUE,
              encoding = "Latin-1")
  
  df <- as.data.frame(df)
  df
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
colNames     <- chartOptions$cols
colNames <- strsplit(colNames,",")
imgPath     <- chartOptions$img_path

df <- GetDataFrame(csvPath)

if(length(chartOptions$filters) > 0) {

  # generate a string of all filters
  filterStr <- ""
  filterContainsList <- list()
  for (i in seq_along(chartOptions$filters)) {
    
    colname <- chartOptions$filters[[i]][["colname"]]
    operator <- chartOptions$filters[[i]][["operator"]]
    required_val <- chartOptions$filters[[i]][["required_val"]]
    
    if (operator == "contains") {
      
      filterContainsList <- append(filterContainsList, 
                                   list(list(colname, required_val)))
    } else {
      
      required_val_modify <- ifelse(operator == "==", 
                                    paste0(" '", required_val, "'"), 
                                    paste0(" ", required_val))
      
      filterStr <- paste0(filterStr, colname, " ", operator, 
                          required_val_modify, " & ")
      
    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)
  
  
  # apply contains filters
  if (length(filterContainsList) > 0) {
    
    for (j in seq_along(filterContainsList)) {
      filterCol <- filterContainsList[[j]][[1]]
      filterVal <- filterContainsList[[j]][[2]]
      
      retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol], 
                            ignore.case = TRUE)
      df <- df[retriveTrues, ]
    }
  }
  
  # apply numeric filters
  if (nchar(filterStr) > 0) {
    
    dfFiltered <- df %>%
      filter_(filterStr)
  } else {
    dfFiltered <- df
  }

  if (nrow(dfFiltered) > 0) {

    strwordCloud <- ""
    for (variable in colNames) {
  
      wcDF <- dfFiltered[variable]
  
      for( i in seq_along(wcDF)) {
        for(j in wcDF[i]) {
          strwordCloud <- paste(strwordCloud, j)
        }
      }
  
    }
  
    strwordCloud <- paste(strwordCloud, collapse = "")
  
  
    # Load the data as a corpus
    docs <- Corpus(VectorSource(strwordCloud))
  
    toSpace <- content_transformer(function (x , pattern ) gsub(pattern, " ", x))
    docs <- tm_map(docs, toSpace, "/")
    docs <- tm_map(docs, toSpace, "@")
    docs <- tm_map(docs, toSpace, "\\|")
  
    # Convert the text to lower case
    docs <- tm_map(docs, content_transformer(tolower))
    # Remove numbers
    docs <- tm_map(docs, removeNumbers)
    # Remove english common stopwords
    docs <- tm_map(docs, removeWords, stopwords("english"))
    # Remove your own stop word
    # specify your stopwords as a character vector
    docs <- tm_map(docs, removeWords, c("blabla1", "blabla2"))
    # Remove punctuations
    docs <- tm_map(docs, removePunctuation)
    # Eliminate extra white spaces
    docs <- tm_map(docs, stripWhitespace)
    # Text stemming
    # docs <- tm_map(docs, stemDocument)
  
    dtm <- TermDocumentMatrix(docs)
    m <- as.matrix(dtm)
    v <- sort(rowSums(m),decreasing=TRUE)
    d <- data.frame(word = names(v),freq=v)
  
    set.seed(1234)
    png(imgPath, width = 480, height = 480)
    wordcloud(words = d$word, freq = d$freq, min.freq = 1,
              max.words=200, random.order=FALSE, rot.per=0.35,
              colors=brewer.pal(8, "Set1"))
    dev.off()
  }
} else { 

  dfFiltered <- df

    strwordCloud <- ""
    for (variable in colNames) {
  
      wcDF <- dfFiltered[variable]
  
      for( i in seq_along(wcDF)) {
        for(j in wcDF[i]) {
          strwordCloud <- paste(strwordCloud, j)
        }
      }
  
    }
  
    strwordCloud <- paste(strwordCloud, collapse = "")
  
      # Load the data as a corpus
      docs <- Corpus(VectorSource(strwordCloud))
    
      toSpace <- content_transformer(function (x , pattern ) gsub(pattern, " ", x))
      docs <- tm_map(docs, toSpace, "/")
      docs <- tm_map(docs, toSpace, "@")
      docs <- tm_map(docs, toSpace, "\\|")
    
      # Convert the text to lower case
      docs <- tm_map(docs, content_transformer(tolower))
      # Remove numbers
      docs <- tm_map(docs, removeNumbers)
      # Remove english common stopwords
      docs <- tm_map(docs, removeWords, stopwords("english"))
      # Remove your own stop word
      # specify your stopwords as a character vector
      docs <- tm_map(docs, removeWords, c("blabla1", "blabla2"))
      # Remove punctuations
      docs <- tm_map(docs, removePunctuation)
      # Eliminate extra white spaces
      docs <- tm_map(docs, stripWhitespace)
      # Text stemming
      # docs <- tm_map(docs, stemDocument)
    
      dtm <- TermDocumentMatrix(docs)
      m <- as.matrix(dtm)
      v <- sort(rowSums(m),decreasing=TRUE)
      d <- data.frame(word = names(v),freq=v)
    
      set.seed(1234)
      png(imgPath, width = 480, height = 480)
      wordcloud(words = d$word, freq = d$freq, min.freq = 1,
                       max.words=200, random.order=FALSE, rot.per=0.35,
                       colors=brewer.pal(8, "Set1"))
      dev.off()
}
objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))