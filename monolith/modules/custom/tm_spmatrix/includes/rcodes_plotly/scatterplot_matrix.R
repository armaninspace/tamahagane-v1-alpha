args <- commandArgs(trailingOnly = TRUE)

suppressPackageStartupMessages(library(base64enc))
suppressPackageStartupMessages(library(data.table))
suppressPackageStartupMessages(library(RJSONIO))
suppressPackageStartupMessages(library(plotly))
suppressPackageStartupMessages(library(dplyr))
suppressPackageStartupMessages(library(GGally))

# random number set
set.seed(1776)

# inbound contract check
inboundContractCheck <- list()

GetDataFrame <- function(csvPath, filesType = "csv") {

  tryCatch({
    
    #df <- fread(input = csvPath,
         #          header = T,
          #          sep = ',',
           #         na.strings = c("", "NA"),
            #        stringsAsFactors = TRUE,
             #       encoding = "Latin-1")

        #df <- read.csv(csvPath)
        df <- read.csv(file = csvPath,
                header = TRUE,
                na.string = c("", "NA"),
                stringsAsFactors = TRUE,
                encoding = "Latin-1"
                )
    
    df <- as.data.frame(df)
    # keep only complete rows
    complete.rows <- complete.cases(df)
    #df <- df[complete.rows,]
    df
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_reading_csv" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_reading_csv" = err))
  }) # End tryCatch
  
}

# coerce data types
convert.magic <- function(obj, types) {
  
  tryCatch({
    
    for (i in 1:length(obj)){
      FUN <- switch(types[i],character = as.character, 
                    numeric = as.numeric, 
                    factor = as.factor,
                    integer = as.integer,
                    logical = as.logical)
      obj[,i] <- FUN(obj[,i])
    }
    obj
    
  }, warning = function(war) {
    outputWarning = TRUE
    # warning handler picks up where warning was generated
    inboundContractCheck <<- append(inboundContractCheck, list("warning_coerce" = war))
  }, error = function(err) {
    outputError = TRUE
    # error handler picks up where error was generated
    inboundContractCheck <<- append(inboundContractCheck, list("error_coerce" = err))
  }) # End tryCatch
  
}

json <- rawToChar(base64decode(args))
chartOptions <- fromJSON(json)

csvPath     <- chartOptions$csv_path
imgPath     <- chartOptions$img_path
colnames    <- chartOptions$x_col
colnames    <- strsplit(colnames,",")
colTypes    <- chartOptions$x_col_type
colTypes    <- strsplit(colTypes,",")
#chartTitle  <- chartOptions$chart_title
xTitle      <- chartOptions$x_title
yTitle      <- chartOptions$y_title


# make vector of columns coerse types
colsTypeCoerse <- c()
for (colType in colTypes[[1]]) {
  
  colsTypeCoerse <- append(colsTypeCoerse, colType)
}

xTitle <- ifelse(is.null(xTitle), "X Col", xTitle)
yTitle <- ifelse(is.null(yTitle), "Y Col", yTitle)
#chartTitle <- ifelse(is.null(chartTitle), "Scatterplot", chartTitle)

f <- list(
  family = "Courier New, monospace",
  size = 18,
  color = "#7f7f7f"
)
x <- list(
  title = xTitle,
  titlefont = f
)
y <- list(
  title = yTitle,
  titlefont = f
)

# check if required number of arguments are available.
if (length(chartOptions) < 4) {
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("required_args_int" = 4))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("Required arguments limit not meet.")
}

# get data frame from CSV
csvLoadTimeElapsed <- system.time(df <- GetDataFrame(paste0(csvPath)))

if(!is.data.frame(df)){
     toJSON(df)
     inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
     inboundContractCheck <- append(inboundContractCheck, list("nodataframe" = FALSE))
     print(toJSON(inboundContractCheck))
     stop("Dataframe missing")
 }else{

# check if csv load successfully or stop execution
if(length(inboundContractCheck[['error_reading_csv']]) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("error reading csv.")
}

# log csv load time
inboundContractCheck <- append(inboundContractCheck, 
                               list("csv_load_time_elapsed" = 
                                      csvLoadTimeElapsed[['elapsed']]))

# log if csv loaded successfully
if(nrow(df) > 0) {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = TRUE))
  inboundContractCheck <- append(inboundContractCheck, list("csv_number_of_rows" = nrow(df)))
} else {
  inboundContractCheck <- append(inboundContractCheck, list("csv_load_status" = FALSE))
  inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
  print(toJSON(inboundContractCheck))
  stop("CSV not loaded successfully.")
}

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
      
      required_val_modify <- ifelse(operator == "==" || operator == "!=",
                                    paste0(" '", required_val, "'"), 
                                    paste0(" ", required_val))
      
      filterStr <- paste0(filterStr, colname, " ", operator, 
                          required_val_modify, " & ")
      
    }
  }
  filterStr <- substr(filterStr, 1, nchar(filterStr)-3)
  
  
  # apply contains filters
  if (length(filterContainsList) > 0) {
    
    # apply log time
    containsFiltersTimeElapsed <- system.time(
    for (j in seq_along(filterContainsList)) {
      filterCol <- filterContainsList[[j]][[1]]
      filterVal <- filterContainsList[[j]][[2]]
      
      retriveTrues <- grepl(pattern = filterVal, x = df[, filterCol], 
                            ignore.case = TRUE)
      df <- df[retriveTrues, ]
    })
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("contains_fillters_time_elapsed" = 
                                          containsFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after contains filters
    if(nrow(df) > 4) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter_int" = nrow(df)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_contains_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying contains filters.")
    }
  }
  
  
  # apply numeric filters
  if (nchar(filterStr) > 0) {
    
    # apply log time
    numericFiltersTimeElapsed <- system.time(
    dfFiltered <- df %>%
      filter_(filterStr))
    
    # log contains Filters Time
    inboundContractCheck <- append(inboundContractCheck, 
                                   list("numeric_fillters_time_elapsed" = 
                                          numericFiltersTimeElapsed[['elapsed']]))
    
    # log if DF have observations after numeric filters
    if(nrow(dfFiltered) > 4) {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = TRUE))
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter_int" = nrow(dfFiltered)))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("nrows_after_numeric_filter" = FALSE))
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
      print(toJSON(inboundContractCheck))
      stop("No rows left after applying numeric filters.")
    }
    
  } else {
    dfFiltered <- df
  }
  for (variable in colnames) {
    
    dfFiltered <- dfFiltered[c(variable)]
    
  }
  
  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
  )
  
  
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  dfFiltered = dfFiltered %>% na.omit()
  if (nrow(dfFiltered) > 0) {

    outputWarning = FALSE
    outputError = FALSE
    tryCatch({
      
      result <- try(
        chartGenerateTimeElapsed <- system.time (
          gg <- ggpairs(dfFiltered, aes_string (alpha=0.4), axisLabels = "show")
          )
        , silent = TRUE)
      
      
      # Process any error messages chart_generating_error
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        # set output message to error
        outputError = TRUE
        
        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))
        
        # Restore default warning reporting
        options(warn=0)
      } else {
        
        result2 <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- ggplotly(gg)
          )
          , silent = TRUE)
        
        # Process any error messages ggplot_to_plotly_generating_error
        if (class(result2) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)
          
          # set output message to error
          outputError = TRUE
          
          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("ggplot_to_plotly_generating_error" = msg))
          
          # Restore default warning reporting
          options(warn=0)
        } else {
          outputResult <- try(
            outputTimeElapsed <- system.time (
              htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)
            )
            ,silent = TRUE)
          
          # Process any error messages output_error
          if (class(outputResult) == "try-error") {
            # Ignore warnings while processing errors
            options(warn = -1)
            
            # set output message to error
            outputError = TRUE
            
            # If this script were a function, warning() and stop()
            # could be called to pass errors upstream
            msg <- geterrmessage()
            inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))
            
            # Restore default warning reporting
            options(warn=0)
          }
          
          # log chart generate time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("chart_generate_time_elapsed" =
                                                chartGenerateTimeElapsed[['elapsed']]))
          
          # log output time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("output_time_elapsed" =
                                                outputTimeElapsed[['elapsed']]))
        }
        
        
      }
      
    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))
      
    }) # End tryCatch
    
    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))
     
  }
  
} else {

  # select desired columns  
  for (variable in colnames) {
    
    dfFiltered <- df[c(variable)]
  }

  # coerce types
  coerceTimeElapsed <- system.time(
    dfFiltered <- convert.magic(dfFiltered, colsTypeCoerse)
  )
  
  # check if coerce columns successfull or stop execution
  if(length(inboundContractCheck[['error_coerce']]) > 0) {
    inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    print(toJSON(inboundContractCheck))
    stop("error coerce columns")
  }
  
  # log coerce time
  inboundContractCheck <- append(inboundContractCheck, 
                                 list("coerce_time_elapsed" = 
                                        coerceTimeElapsed[['elapsed']]))
  dfFiltered = dfFiltered %>% na.omit()
  if (nrow(dfFiltered) > 0) {
    
    outputWarning = FALSE
    outputError = FALSE
    tryCatch({
      
      result <- try(
        chartGenerateTimeElapsed <- system.time (
          gg <- ggpairs(dfFiltered, aes_string (alpha=0.4), axisLabels = "show")
        )
        , silent = TRUE)
      
      
      # Process any error messages chart_generating_error
      if (class(result) == "try-error") {
        # Ignore warnings while processing errors
        options(warn = -1)
        # set output message to error
        outputError = TRUE
        
        # If this script were a function, warning() and stop()
        # could be called to pass errors upstream
        msg <- geterrmessage()
        inboundContractCheck <- append(inboundContractCheck, list("chart_generating_error" = msg))
        
        # Restore default warning reporting
        options(warn=0)
      } else {
        
        result2 <- try(
          chartGenerateTimeElapsed <- system.time (
            p <- ggplotly(gg)
          )
          , silent = TRUE)
        
        # Process any error messages ggplot_to_plotly_generating_error
        if (class(result2) == "try-error") {
          # Ignore warnings while processing errors
          options(warn = -1)
          
          # set output message to error
          outputError = TRUE
          
          # If this script were a function, warning() and stop()
          # could be called to pass errors upstream
          msg <- geterrmessage()
          inboundContractCheck <- append(inboundContractCheck, list("ggplot_to_plotly_generating_error" = msg))
          
          # Restore default warning reporting
          options(warn=0)
        } else {
          outputResult <- try(
            outputTimeElapsed <- system.time (
              htmlwidgets::saveWidget(p, imgPath, selfcontained = FALSE)
            )
            ,silent = TRUE)
          
          # Process any error messages output_error
          if (class(outputResult) == "try-error") {
            # Ignore warnings while processing errors
            options(warn = -1)
            
            # set output message to error
            outputError = TRUE
            
            # If this script were a function, warning() and stop()
            # could be called to pass errors upstream
            msg <- geterrmessage()
            inboundContractCheck <- append(inboundContractCheck, list("output_error" = msg))
            
            # Restore default warning reporting
            options(warn=0)
          }
          
          # log chart generate time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("chart_generate_time_elapsed" =
                                                chartGenerateTimeElapsed[['elapsed']]))
          
          # log output time
          inboundContractCheck <- append(inboundContractCheck,
                                         list("output_time_elapsed" =
                                                outputTimeElapsed[['elapsed']]))
        }
        
        
      }
      
    }, warning = function(war) {
      outputWarning = TRUE
      # warning handler picks up where warning was generated
      inboundContractCheck <- append(inboundContractCheck, list("warning_output" = war))
    }, error = function(err) {
      outputError = TRUE
      # error handler picks up where error was generated
      inboundContractCheck <- append(inboundContractCheck, list("error_output" = err))
      
    }) # End tryCatch
    
    # output generated successfully
    if(! outputError) {
      inboundContractCheck <- append(inboundContractCheck, list("output" = TRUE))
    } else {
      inboundContractCheck <- append(inboundContractCheck, list("output" = FALSE))
    }
    print(toJSON(inboundContractCheck))
    
  }
}
}

objList = list()
objList <- sapply(ls(), function(x)
  objList <- x
)
inboundContractCheck <- append(inboundContractCheck, list("objList" = objList))
inboundContractCheck <- append(inboundContractCheck, list("dfFiltered" = dfFiltered))
print(toJSON(inboundContractCheck))



